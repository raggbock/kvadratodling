/**
 * Import a Cowork-generated plants.json into Supabase.
 *
 * Usage:
 *   1. Put your service-role key in SUPABASE_SERVICE_ROLE_KEY (NEVER commit it).
 *   2. Optionally put SUPABASE_URL — defaults to NEXT_PUBLIC_SUPABASE_URL from .env.
 *   3. Run:  npm run import:plants -- <path-to-plants.json>
 *
 * The script:
 *   - Validates the JSON against the expected Cowork schema (Zod).
 *   - Upserts each plant on the `slug` unique key (re-runs are safe).
 *   - Resolves companion/antagonist references by slug → id.
 *   - Writes plant_compatibility rows bidirectionally and idempotently.
 *
 * Run after applying migrations `seed_plants_catalog`,
 * `localize_plant_names_to_swedish` and `extend_plants_for_richer_catalog`.
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '../src/utils/supabase/database.types';

const Zone = z.enum(['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8']);

const RelationRef = z.object({
  slug: z.string(),
  reason: z.string(),
});

const PlantSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  common_name: z.string().min(1),
  english_name: z.string().optional(),
  scientific_name: z.string().optional(),
  family: z.string().optional(),
  emoji: z.string().min(1),

  plants_per_sqft: z.number().positive(),
  sun_requirement: z.enum(['full_sun', 'part_shade', 'full_shade']),
  water_need: z.enum(['low', 'medium', 'high']),
  frost_tolerant: z.boolean(),

  days_to_maturity_min: z.number().int().nullable().optional(),
  days_to_maturity_max: z.number().int().nullable().optional(),
  sow_indoors_days_before_frost: z.number().int().nullable().optional(),
  direct_sow_days_before_frost: z.number().int().nullable().optional(),
  transplant_days_after_frost: z.number().int().nullable().optional(),
  autumn_plant_days_before_first_frost: z.number().int().nullable().optional(),

  zones: z.object({
    min: Zone,
    max: Zone,
    note: z.string().nullable().optional(),
  }).optional(),

  description: z.string().optional(),
  tips: z.string().optional(),
  pests: z.array(z.string()).optional(),
  diseases: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  companions: z.array(RelationRef).optional(),
  antagonists: z.array(RelationRef).optional(),
});
type Plant = z.infer<typeof PlantSchema>;

const FileSchema = z.object({
  version: z.string(),
  generated_at: z.string().optional(),
  square_cm: z.number().optional(),
  source_notes: z.string().optional(),
  plants: z.array(PlantSchema).min(1),
});

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    console.error(`✗ Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

function toPlantInsert(p: Plant): TablesInsert<'plants'> {
  return {
    slug: p.slug,
    common_name: p.common_name,
    english_name: p.english_name ?? null,
    scientific_name: p.scientific_name ?? null,
    family: p.family ?? null,
    emoji: p.emoji,
    plants_per_sqft: p.plants_per_sqft,
    sun_requirement: p.sun_requirement,
    water_need: p.water_need,
    frost_tolerant: p.frost_tolerant,
    days_to_maturity_min: p.days_to_maturity_min ?? null,
    days_to_maturity_max: p.days_to_maturity_max ?? null,
    sow_indoors_days_before_frost: p.sow_indoors_days_before_frost ?? null,
    direct_sow_days_before_frost: p.direct_sow_days_before_frost ?? null,
    transplant_days_after_frost: p.transplant_days_after_frost ?? null,
    autumn_plant_days_before_first_frost: p.autumn_plant_days_before_first_frost ?? null,
    description: p.description ?? null,
    tips: p.tips ?? null,
    pests: p.pests ?? null,
    diseases: p.diseases ?? null,
    tags: p.tags ?? null,
    zones_min: p.zones?.min ?? null,
    zones_max: p.zones?.max ?? null,
    zones_note: p.zones?.note ?? null,
  };
}

async function main() {
  const [inputPath] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: npm run import:plants -- <path-to-plants.json>');
    process.exit(1);
  }

  const url = env('SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');

  const raw = readFileSync(inputPath, 'utf8');
  let file: z.infer<typeof FileSchema>;
  try {
    file = FileSchema.parse(JSON.parse(raw));
  } catch (err) {
    console.error('✗ JSON failed schema validation:');
    if (err instanceof z.ZodError) {
      for (const issue of err.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    } else {
      console.error(err);
    }
    process.exit(1);
  }

  console.log(`✓ Loaded ${file.plants.length} plants from ${inputPath}`);
  if (file.square_cm && file.square_cm !== 30) {
    console.warn(`⚠ File square_cm=${file.square_cm}, app expects 30. plants_per_sqft values may need scaling.`);
  }

  // Cross-reference companion/antagonist slugs against the plant list.
  const knownSlugs = new Set(file.plants.map((p) => p.slug));
  const dangling: string[] = [];
  for (const p of file.plants) {
    for (const r of [...(p.companions ?? []), ...(p.antagonists ?? [])]) {
      if (!knownSlugs.has(r.slug)) dangling.push(`${p.slug} → ${r.slug}`);
    }
  }
  if (dangling.length > 0) {
    console.warn(`⚠ ${dangling.length} dangling relation(s); will be skipped:`);
    for (const d of dangling.slice(0, 10)) console.warn(`    ${d}`);
    if (dangling.length > 10) console.warn(`    … and ${dangling.length - 10} more`);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ---- Plants ----
  const plantRows = file.plants.map(toPlantInsert);
  console.log(`→ Upserting ${plantRows.length} plant rows…`);
  const { data: inserted, error: plantErr } = await supabase
    .from('plants')
    .upsert(plantRows, { onConflict: 'slug' })
    .select('id, slug');

  if (plantErr) {
    console.error('✗ Plant upsert failed:', plantErr.message, plantErr.details ?? '');
    process.exit(1);
  }
  const slugToId = new Map<string, string>();
  for (const p of inserted ?? []) slugToId.set(p.slug, p.id);
  console.log(`✓ ${slugToId.size} plants in DB after upsert`);

  // ---- Compatibility (bidirectional, deduped) ----
  type Pair = TablesInsert<'plant_compatibility'>;
  const pairs: Pair[] = [];
  const seen = new Set<string>();

  function pushPair(a: string, b: string, rel: 'companion' | 'antagonist', notes: string | null) {
    const key = `${a}:${b}:${rel}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ plant_id: a, other_plant_id: b, relationship: rel, notes });
  }

  for (const p of file.plants) {
    const pid = slugToId.get(p.slug);
    if (!pid) continue;
    for (const c of p.companions ?? []) {
      const oid = slugToId.get(c.slug);
      if (!oid) continue;
      pushPair(pid, oid, 'companion', c.reason);
      pushPair(oid, pid, 'companion', c.reason);
    }
    for (const a of p.antagonists ?? []) {
      const oid = slugToId.get(a.slug);
      if (!oid) continue;
      pushPair(pid, oid, 'antagonist', a.reason);
      pushPair(oid, pid, 'antagonist', a.reason);
    }
  }

  console.log(`→ Upserting ${pairs.length} compatibility rows…`);
  if (pairs.length > 0) {
    // Chunk to keep request size sane.
    const CHUNK = 500;
    for (let i = 0; i < pairs.length; i += CHUNK) {
      const slice = pairs.slice(i, i + CHUNK);
      const { error } = await supabase
        .from('plant_compatibility')
        .upsert(slice, { onConflict: 'plant_id,other_plant_id' });
      if (error) {
        console.error(`✗ Compatibility upsert failed at chunk ${i}–${i + slice.length}:`, error.message);
        process.exit(1);
      }
    }
  }
  console.log(`✓ ${pairs.length} compatibility rows written`);

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

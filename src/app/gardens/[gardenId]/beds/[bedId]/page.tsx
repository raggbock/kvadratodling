import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import BedPlanner from './BedPlanner';

export default async function BedPage({
  params,
}: {
  params: Promise<{ gardenId: string; bedId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { gardenId, bedId } = await params;
  const { data: bed } = await supabase
    .from('beds')
    .select('id, name, rows, cols, width_cm, length_cm, garden:gardens(name), planting_slots(id, row, col, plant:plants(slug, common_name))')
    .eq('id', bedId)
    .eq('garden_id', gardenId)
    .single();

  if (!bed) notFound();

  const garden = bed.garden as unknown as { name: string } | null;
  if (!garden) notFound();

  const { data: dbPlants } = await supabase
    .from('plants')
    .select('slug, common_name, emoji, plants_per_sqft')
    .eq('is_active', true)
    .order('common_name');

  const palette = (dbPlants ?? []).map((p) => ({
    slug: p.slug,
    name: p.common_name,
    emoji: p.emoji,
    plantsPerSqft: Number(p.plants_per_sqft),
  }));

  // Companions/antagonists for the whole catalog. ~1000 rows total; we resolve
  // both FKs to slug here so the client can do all lookups by slug, and we
  // materialise the relation symmetrically — the planner doesn't care which
  // way the row happens to be stored.
  const { data: compat } = await supabase
    .from('plant_compatibility')
    .select(
      'relationship, plant:plants!plant_compatibility_plant_id_fkey(slug), other:plants!plant_compatibility_other_plant_id_fkey(slug)',
    );

  type CompatRow = {
    relationship: 'companion' | 'antagonist';
    plant: { slug: string } | null;
    other: { slug: string } | null;
  };

  const companionMap: Record<string, { companions: string[]; antagonists: string[] }> = {};
  const ensureEntry = (slug: string) => {
    if (!companionMap[slug]) companionMap[slug] = { companions: [], antagonists: [] };
    return companionMap[slug];
  };
  const seen = new Set<string>(); // dedup symmetric inserts
  for (const row of (compat ?? []) as unknown as CompatRow[]) {
    if (!row.plant || !row.other) continue;
    const pairs: [string, string][] = [
      [row.plant.slug, row.other.slug],
      [row.other.slug, row.plant.slug],
    ];
    for (const [a, b] of pairs) {
      const key = `${a}|${row.relationship}|${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const bucket = row.relationship === 'companion' ? 'companions' : 'antagonists';
      ensureEntry(a)[bucket].push(b);
    }
  }

  const slots = bed.planting_slots as unknown as {
    row: number;
    col: number;
    plant: { slug: string; common_name: string } | null;
  }[];
  const initialSlots = slots.map((s) => {
    const paletteMatch = s.plant ? palette.find((p) => p.slug === s.plant!.slug) : null;
    return {
      row: s.row,
      col: s.col,
      plantSlug: s.plant?.slug ?? null,
      plantEmoji: paletteMatch?.emoji ?? null,
      plantName: s.plant?.common_name ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 text-sm text-text-subtle">
        <Link href="/gardens" className="hover:text-brand-emphasis">
          Mina odlingar
        </Link>{' '}
        /{' '}
        <Link href={`/gardens/${gardenId}`} className="hover:text-brand-emphasis">
          {garden.name}
        </Link>{' '}
        /
      </div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-default">{bed.name}</h1>
          <p className="mt-1 text-sm text-text-subtle">
            {bed.width_cm ?? bed.cols * 30}×{bed.length_cm ?? bed.rows * 30} cm
            &mdash; {bed.cols} × {bed.rows} rutor
            {((bed.width_cm ?? bed.cols * 30) > bed.cols * 30 ||
              (bed.length_cm ?? bed.rows * 30) > bed.rows * 30) && (
              <span className="ml-2 text-xs text-status-warning">
                (planeras som {bed.cols * 30}×{bed.rows * 30} cm — resten är utanför rutnätet)
              </span>
            )}
          </p>
        </div>
        <Link
          href={`/gardens/${gardenId}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-default px-3 py-2 text-sm font-medium text-text-default hover:bg-surface-subtle"
        >
          ← Tillbaka till {garden.name}
        </Link>
      </div>

      <BedPlanner
        bedId={bedId}
        rows={bed.rows}
        cols={bed.cols}
        initialSlots={initialSlots}
        palette={palette}
        companions={companionMap}
      />
    </div>
  );
}

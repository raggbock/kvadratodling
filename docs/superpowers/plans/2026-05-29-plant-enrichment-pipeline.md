# Source-Grounded Plant Enrichment Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable pipeline that enriches kvadratodling's plant data from approved Swedish sources with real fetched citations, gated by human review, feeding the existing `import-plants.ts` contract unchanged.

**Architecture:** A documented generation **playbook** (the reusable "prompt") that the Claude Code agent executes — search approved sources, fetch real pages, extract value + exact quote + URL, score confidence, omit when unsourced. Two small **pure helpers** carry the deterministic logic (spacing→density math; review-report rendering) and are unit-tested. Output is a candidate `plants.json` (existing Zod schema) plus a markdown review report; nothing reaches the DB without a human ✓.

**Tech Stack:** TypeScript, `tsx` (already present), `node:test` (built-in, no new deps), Zod (existing), Supabase (existing). Tests run with `npx tsx --test <file>`.

---

## File Structure

- **Create** `data/plants/ENRICHMENT-PROMPT.md` — the reusable grounded-generation playbook (the "prompt"). Prose, no tests.
- **Create** `scripts/lib/enrichment-types.ts` — shared record types (`Confidence`, `FieldProvenance`, `PlantEnrichment`).
- **Create** `scripts/lib/plant-density.ts` + `.test.ts` — `spacingToPlantsPerSqft` (Swedish plantavstånd cm → SFG grid density).
- **Create** `scripts/lib/enrichment-report.ts` + `.test.ts` — `renderReviewReport(records, batch, isoDate)` → markdown.
- **Create** `scripts/enrich-report.ts` — thin CLI: records JSON → `data/plants/review/<batch>.md`.
- **Modify** `package.json` — add `"test"` script.
- **Modify** `scripts/README.md` — document the enrichment workflow.
- **Produced at runtime** `data/plants/<batch>.records.json`, `data/plants/review/<batch>.md`, `data/plants/<batch>.plants.json`.

---

## Task 1: Test script wiring

**Files:**
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Add the test script**

In `package.json` `"scripts"`, add after `"lint": "eslint",`:

```json
    "test": "tsx --test scripts/lib/*.test.ts",
```

- [ ] **Step 2: Verify it runs (no tests yet = no failure)**

Run: `npx tsx --test scripts/lib/*.test.ts`
Expected: exits 0 with `# tests 0` (glob matches nothing yet) — or "no test files" message; either is fine. Confirms the runner is wired.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add node:test runner script for scripts/lib"
```

---

## Task 2: Density helper (plantavstånd → plants_per_sqft)

The SFG grid method: a 30 cm side fits `floor(30 / spacing)` plants per side; squared = per square. Spacing > 30 cm yields a fraction (<1, plant spans squares). This grounds `plants_per_sqft` in Swedish plantavstånd cross-checked against the SFG standard.

**Files:**
- Create: `scripts/lib/plant-density.ts`
- Test: `scripts/lib/plant-density.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// scripts/lib/plant-density.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spacingToPlantsPerSqft } from './plant-density';

test('grid densities match SFG standard', () => {
  assert.equal(spacingToPlantsPerSqft(7.5), 16); // morot
  assert.equal(spacingToPlantsPerSqft(10), 9);
  assert.equal(spacingToPlantsPerSqft(15), 4);
  assert.equal(spacingToPlantsPerSqft(30), 1);
});

test('spacing wider than a square yields a fraction < 1', () => {
  assert.equal(spacingToPlantsPerSqft(60), 0.25); // squash-like
  assert.equal(spacingToPlantsPerSqft(45), 0.44); // rounded to 2 decimals
});

test('rounds down to whole plants per side', () => {
  assert.equal(spacingToPlantsPerSqft(8), 9); // 30/8 = 3.75 → 3 per side → 9
});

test('rejects non-positive spacing', () => {
  assert.throws(() => spacingToPlantsPerSqft(0));
  assert.throws(() => spacingToPlantsPerSqft(-5));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/lib/plant-density.test.ts`
Expected: FAIL — `Cannot find module './plant-density'` / `spacingToPlantsPerSqft is not a function`.

- [ ] **Step 3: Write minimal implementation**

```ts
// scripts/lib/plant-density.ts

/**
 * Convert a plant spacing (cm, from a Swedish seed-company plantavstånd) into
 * plants per 30×30 cm square, using the Square Foot Gardening grid method:
 * floor(30 / spacing) plants per side, squared. Spacing wider than the square
 * gives a fraction < 1 (the plant occupies multiple squares).
 *
 * This is the ONLY place plants_per_sqft is derived for new plants. Existing
 * values are left untouched unless a review flags a discrepancy.
 */
export function spacingToPlantsPerSqft(spacingCm: number): number {
  if (!(spacingCm > 0)) {
    throw new Error(`spacingCm must be positive, got ${spacingCm}`);
  }
  const perSide = 30 / spacingCm;
  if (perSide >= 1) {
    const whole = Math.floor(perSide);
    return whole * whole;
  }
  // Wider than one square: fractional, rounded to 2 decimals.
  return Math.round(perSide * perSide * 100) / 100;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/lib/plant-density.test.ts`
Expected: PASS — `# pass 4 # fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/plant-density.ts scripts/lib/plant-density.test.ts
git commit -m "feat(enrich): plantavstånd→plants_per_sqft density helper"
```

---

## Task 3: Enrichment record types

The provenance record carried through the pipeline and into the review report. Decoupled from the DB row so the research step only ever fills verified facts.

**Files:**
- Create: `scripts/lib/enrichment-types.ts`

- [ ] **Step 1: Write the types**

```ts
// scripts/lib/enrichment-types.ts

/** How well-supported a proposed value is. `low` is NEVER auto-included. */
export type Confidence = 'high' | 'medium' | 'low';

/** One proposed field value with its real, fetched provenance. */
export interface FieldProvenance {
  field: string;            // e.g. "days_to_maturity_max"
  proposedValue: unknown;   // null when no source was found (omit-over-invent)
  currentValue: unknown;    // current DB value, for the diff
  sourceUrl: string | null; // a real URL that was fetched, or null
  quote: string | null;     // exact supporting passage from that URL
  confidence: Confidence;
  flagged: boolean;         // contested/folklore, or sources conflict
  note?: string;            // e.g. "Svensk Trädgård and Impecta disagree"
}

export interface PlantEnrichment {
  slug: string;
  commonName: string;
  fields: FieldProvenance[];
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (clean).

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/enrichment-types.ts
git commit -m "feat(enrich): provenance record types"
```

---

## Task 4: Review-report renderer

Pure function: records → markdown review gate. High/medium-confidence fields are listed with an approve checkbox; low or flagged fields go under a "Kräver din bedömning" section so contested data can never slip in silently. Date is passed in (keeps the function pure/deterministic and testable).

**Files:**
- Create: `scripts/lib/enrichment-report.ts`
- Test: `scripts/lib/enrichment-report.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// scripts/lib/enrichment-report.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReviewReport } from './enrichment-report';
import type { PlantEnrichment } from './enrichment-types';

const sample: PlantEnrichment[] = [
  {
    slug: 'morot',
    commonName: 'Morot',
    fields: [
      {
        field: 'days_to_maturity_max',
        proposedValue: 100,
        currentValue: null,
        sourceUrl: 'https://www.impecta.se/morot',
        quote: 'Skördetid cirka 90–100 dagar efter sådd.',
        confidence: 'high',
        flagged: false,
      },
      {
        field: 'companions',
        proposedValue: ['lok'],
        currentValue: null,
        sourceUrl: null,
        quote: null,
        confidence: 'low',
        flagged: true,
        note: 'Folklore — ingen källa i allowlisten bekräftar.',
      },
    ],
  },
];

test('renders the batch heading and date', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  assert.match(md, /pilot-01/);
  assert.match(md, /2026-05-29/);
});

test('high-confidence field shows value, source, quote and an approve checkbox', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  assert.match(md, /days_to_maturity_max/);
  assert.match(md, /100/);
  assert.match(md, /impecta\.se/);
  assert.match(md, /90–100 dagar/);
  assert.match(md, /- \[ \]/); // an unchecked approve box
});

test('flagged/low field is placed under the review-required section', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  const idx = md.indexOf('Kräver din bedömning');
  assert.ok(idx > -1, 'has a review-required section');
  assert.ok(md.indexOf('companions') > idx, 'companions appears after that heading');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/lib/enrichment-report.test.ts`
Expected: FAIL — `Cannot find module './enrichment-report'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// scripts/lib/enrichment-report.ts
import type { PlantEnrichment, FieldProvenance } from './enrichment-types';

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '_(saknas)_';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '_(tom)_';
  return String(v);
}

function fieldBlock(f: FieldProvenance): string {
  const src = f.sourceUrl ? `[källa](${f.sourceUrl})` : '_ingen källa_';
  const quote = f.quote ? `\n  > ${f.quote}` : '';
  const note = f.note ? `\n  _${f.note}_` : '';
  return (
    `- [ ] **${f.field}**: ${fmt(f.proposedValue)} ` +
    `(nu: ${fmt(f.currentValue)}) · konfidens: ${f.confidence} · ${src}${quote}${note}`
  );
}

/**
 * Render the human review gate. `isoDate` is passed in so the function stays
 * pure and testable. High/medium fields are approvable inline; low or flagged
 * fields are isolated under "Kräver din bedömning".
 */
export function renderReviewReport(
  records: PlantEnrichment[],
  batch: string,
  isoDate: string,
): string {
  const lines: string[] = [
    `# Granskning: ${batch}`,
    '',
    `Datum: ${isoDate} · Bocka i ✓ för fält du godkänner. Inget importeras utan din signoff.`,
    '',
  ];

  for (const plant of records) {
    lines.push(`## ${plant.commonName} (\`${plant.slug}\`)`, '');

    const ready = plant.fields.filter((f) => !f.flagged && f.confidence !== 'low');
    const review = plant.fields.filter((f) => f.flagged || f.confidence === 'low');

    if (ready.length) {
      lines.push('### Föreslås (källgrundat)', '');
      for (const f of ready) lines.push(fieldBlock(f));
      lines.push('');
    }
    if (review.length) {
      lines.push('### ⚠ Kräver din bedömning', '');
      for (const f of review) lines.push(fieldBlock(f));
      lines.push('');
    }
  }

  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/lib/enrichment-report.test.ts`
Expected: PASS — `# pass 3 # fail 0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/enrichment-report.ts scripts/lib/enrichment-report.test.ts
git commit -m "feat(enrich): review-report renderer with sign-off gate"
```

---

## Task 5: Thin CLI to emit the review file

**Files:**
- Create: `scripts/enrich-report.ts`

- [ ] **Step 1: Write the CLI**

```ts
// scripts/enrich-report.ts
//
// Usage: npx tsx scripts/enrich-report.ts <records.json> <batch-name>
// Reads a PlantEnrichment[] JSON (produced by the enrichment playbook run)
// and writes data/plants/review/<batch>.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { renderReviewReport } from './lib/enrichment-report';
import type { PlantEnrichment } from './lib/enrichment-types';

const [recordsPath, batch] = process.argv.slice(2);
if (!recordsPath || !batch) {
  console.error('Usage: npx tsx scripts/enrich-report.ts <records.json> <batch-name>');
  process.exit(1);
}

const records = JSON.parse(readFileSync(recordsPath, 'utf8')) as PlantEnrichment[];
const isoDate = new Date().toISOString().slice(0, 10);
const md = renderReviewReport(records, batch, isoDate);

mkdirSync('data/plants/review', { recursive: true });
const out = `data/plants/review/${batch}.md`;
writeFileSync(out, md, 'utf8');
console.log(`✓ Wrote ${out} (${records.length} plants)`);
```

- [ ] **Step 2: Smoke-test with a tiny fixture**

```bash
mkdir -p data/plants
cat > /tmp/rec.json <<'JSON'
[{"slug":"test","commonName":"Test","fields":[{"field":"days_to_maturity_max","proposedValue":100,"currentValue":null,"sourceUrl":"https://example.se","quote":"x","confidence":"high","flagged":false}]}]
JSON
npx tsx scripts/enrich-report.ts /tmp/rec.json smoke
```
Expected: `✓ Wrote data/plants/review/smoke.md (1 plants)` and the file exists. Then clean up: `rm -f data/plants/review/smoke.md /tmp/rec.json`

- [ ] **Step 3: Commit**

```bash
git add scripts/enrich-report.ts
git commit -m "feat(enrich): CLI to render review report from records JSON"
```

---

## Task 6: The enrichment playbook (the reusable "prompt")

This is the deliverable the user asked for — the rigorous, source-grounded generation procedure the agent follows each batch.

**Files:**
- Create: `data/plants/ENRICHMENT-PROMPT.md`

- [ ] **Step 1: Write the playbook**

````markdown
# Växtberikning — körbok (källgrundad generering)

Detta är proceduren Claude Code följer för att berika växtdata. Den körs som
ett jobb HÄR (med WebSearch/WebFetch), aldrig som blind textgenerering.

## Hård regel
Fakta får ALDRIG komma ur modellens minne. Varje värde grundas i en faktiskt
hämtad sida från allowlisten nedan, med exakt citat + URL. Hittas ingen källa
→ sätt fältet `null`, `confidence: "low"`, `flagged: true`. Utelämna hellre
än uppfinn. (Samma kontrakt som `src/lib/plant-faq.ts` och `memory/verified-data-only.md`.)

## Käll-allowlist (rangordnad, svenska/klimatspecifika först)
1. Riksförbundet Svensk Trädgård — zoner, frosttålighet, svenska såfönster.
2. SLU / Jordbruksverket — skadegörare, sjukdomar, växtbiologi.
3. Svenska fröföretag (Impecta, Runåbergs, Lindbloms, Nelson Garden) — dagar
   till skörd, sådd-offset, plantavstånd.
4. Square Foot Gardening (Mel Bartholomew) — ENDAST `plants_per_sqft`.

Bloggar/forum/oidentifierade källor räknas inte.

## Fält → källa
| Fält | Källa | Regel |
|---|---|---|
| zones_min/max/note, frost_tolerant | Svensk Trädgård | — |
| sow_indoors/direct_sow/transplant_*_frost | Svensk Trädgård + fröföretag | relativt sista frost, ALDRIG absolut månad |
| days_to_maturity_min/max | Fröföretag | sortvariation → spann; konflikt → flagga |
| plants_per_sqft | SFG, korskolla plantavstånd via `spacingToPlantsPerSqft` | avvikelse → flagga |
| pests, diseases | SLU/Jordbruksverket | — |
| companions, antagonists | Endast med namngiven källa | annars utelämna + flagga (folklore) |
| description, tips | Syntetisera ENBART ur redan verifierade fält | inga nya fakta |

## Per fält
1. WebSearch mot rätt källa enligt tabellen.
2. WebFetch den faktiska sidan.
3. Extrahera värdet + exakt stödcitat + URL. Saknas → null/low/flagged.
4. Korsverifiera enligt regeln. Konflikt → båda sparas, `flagged: true`.
5. Sätt konfidens: `high` (≥2 godkända källor enas / 1 auktoritativ för
   fälttypen) · `medium` (1 ok källa) · `low` (tunt/omtvistat).

## Output
1. `data/plants/<batch>.records.json` — `PlantEnrichment[]`
   (se `scripts/lib/enrichment-types.ts`).
2. Kör `npx tsx scripts/enrich-report.ts data/plants/<batch>.records.json <batch>`
   → `data/plants/review/<batch>.md`.
3. Presentera rapporten. Efter användarens ✓: bygg `data/plants/<batch>.plants.json`
   (Zod-schemat i `scripts/import-plants.ts`) med BARA godkända fält (konfidens
   ≥ medium, ej avvisade), och kör `npm run import:plants -- data/plants/<batch>.plants.json`.
````

- [ ] **Step 2: Commit**

```bash
git add data/plants/ENRICHMENT-PROMPT.md
git commit -m "docs(enrich): source-grounded generation playbook"
```

---

## Task 7: Document the workflow in scripts/README.md

**Files:**
- Modify: `scripts/README.md` (append a section)

- [ ] **Step 1: Append the section**

Add to the end of `scripts/README.md`:

```markdown

## Plant enrichment (source-grounded)

Enrich plant data from approved Swedish sources with real citations and a human
review gate. The full procedure lives in `data/plants/ENRICHMENT-PROMPT.md`.

Flow per batch:

1. Agent runs the playbook → `data/plants/<batch>.records.json` (provenance).
2. `npx tsx scripts/enrich-report.ts data/plants/<batch>.records.json <batch>`
   → `data/plants/review/<batch>.md` (your sign-off gate).
3. After you approve, the approved fields are written to a Zod-valid
   `data/plants/<batch>.plants.json` and imported with `npm run import:plants`.

Nothing reaches the DB without your ✓. Facts never come from model memory —
only from fetched, cited sources in the allowlist.
```

- [ ] **Step 2: Commit**

```bash
git add scripts/README.md
git commit -m "docs(enrich): document enrichment workflow in scripts README"
```

---

## Task 8: Execute the pilot (5 thin existing plants)

This task is a research/integration run, not unit-testable. It proves the pipeline and produces the first review report for the user.

**Files:**
- Produced: `data/plants/pilot-01.records.json`, `data/plants/review/pilot-01.md`

- [ ] **Step 1: Establish read access to current plant data**

Check for local Supabase creds: read `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` + anon key. If present, query the public `plants` table via the Supabase REST endpoint. If absent, derive current field values by fetching the live public catalog pages (`https://kvadratodling.se/catalog/<slug>`). Record which approach was used.

- [ ] **Step 2: Gap detection — pick the 5 thinnest plants**

List active plants and score each by missing/thin fields (null `description`/`tips`, empty `pests`/`diseases`, missing `zones_*`, missing sowing offsets, no companions). Select the 5 with the most gaps. Print the chosen slugs + their gap lists.

- [ ] **Step 3: Run the playbook for each gap field**

Follow `data/plants/ENRICHMENT-PROMPT.md` per field: WebSearch the mapped source → WebFetch → extract value + exact quote + URL → cross-verify → set confidence → `flagged`/null when unsourced. Assemble `PlantEnrichment[]` and write `data/plants/pilot-01.records.json`.

- [ ] **Step 4: Render the review report**

Run: `npx tsx scripts/enrich-report.ts data/plants/pilot-01.records.json pilot-01`
Expected: `✓ Wrote data/plants/review/pilot-01.md (5 plants)`.

- [ ] **Step 5: Commit the pilot artifacts**

```bash
git add data/plants/pilot-01.records.json data/plants/review/pilot-01.md
git commit -m "feat(enrich): pilot-01 source-grounded records + review report"
```

- [ ] **Step 6: Present for sign-off**

Show the user `data/plants/review/pilot-01.md`. Walk through any ⚠ flagged fields. Tune the confidence bar / report format per feedback. **Stop here — do not import without the user's ✓.**

---

## Task 9: Finalize approved data and import (GATED on Task 8 sign-off)

Only after the user approves the pilot review.

**Files:**
- Produced: `data/plants/pilot-01.plants.json`

- [ ] **Step 1: Build the Zod-valid plants.json from approved fields**

Map approved records (confidence ≥ medium, not rejected) into the `FileSchema`/`PlantSchema` shape from `scripts/import-plants.ts`. Omit rejected/flagged fields (leave them null). Write `data/plants/pilot-01.plants.json`.

- [ ] **Step 2: Dry-validate against the schema before touching the DB**

The import script validates with Zod and prints per-field issues on failure. Confirm `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`.
Run: `npm run import:plants -- data/plants/pilot-01.plants.json`
Expected: `✓ Loaded 5 plants…` then `✓ N plants in DB after upsert`. On schema failure, fix `plants.json` and re-run (idempotent).

- [ ] **Step 3: Verify on the live site**

Fetch one updated plant page (`https://kvadratodling.se/catalog/<slug>`) and confirm the enriched fields render. Spot-check that no flagged/unsourced value leaked in.

- [ ] **Step 4: Commit and report**

```bash
git add data/plants/pilot-01.plants.json
git commit -m "feat(enrich): import-ready approved data for pilot-01"
```

Report: which fields were enriched, which were flagged/omitted, and confirm the truth contract held (no unsourced value imported).

---

## Self-Review

**Spec coverage:** verification mechanism (Tasks 6, 8) · approved sources + field map (Task 6) · pipeline stages (Tasks 4–8) · output artifacts plants.json + review file (Tasks 5, 9) · truth guardrails incl. omit-over-invent, frost-relative sowing, companion folklore guard (Tasks 4, 6) · review gate before import (Tasks 8–9) · pilot→scale (Task 8) · plants_per_sqft via SFG + plantavstånd cross-check (Task 2, Task 6 map). All covered.

**Placeholder scan:** no TBD/TODO; all code shown in full; all commands have expected output.

**Type consistency:** `spacingToPlantsPerSqft` (Task 2) used in the Task 6 field map; `PlantEnrichment`/`FieldProvenance`/`Confidence` (Task 3) used by `renderReviewReport` (Task 4), the CLI (Task 5) and the playbook (Task 6). `renderReviewReport(records, batch, isoDate)` signature matches across Tasks 4 and 5.

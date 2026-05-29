# Autumn-Planted Crop Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let autumn-planted crops (e.g. garlic) appear correctly in the growing schedule — set in autumn, harvested the following summer — without abusing the spring-frost-relative sow fields.

**Architecture:** One nullable column `autumn_plant_days_before_first_frost` marks a plant as autumn-planted. `computeSchedule` gains an optional `firstFrostDate`; when both are present it emits a `plant_autumn` event anchored on the zone's first autumn frost and a harvest `days_to_maturity` later (lands next summer via the existing harvest math). Existing spring behaviour is untouched.

**Tech Stack:** TypeScript, `node:test` via `tsx` (`npm test`), Supabase (live DB via MCP), Zod, Next.js 16.

---

## File Structure

- **Modify** `src/lib/plantSchedule.ts` — new `plant_autumn` kind, optional input field + param, autumn branch, `KIND_STYLES` entry.
- **Create** `src/lib/plantSchedule.test.ts` — unit tests for the autumn branch.
- **Modify** `src/lib/zones.ts` — `firstFrostDateForYear` + `firstFrostMDForLastFrostMD` helpers.
- **Create** `src/lib/zones.test.ts` — test the nearest-zone autumn helper.
- **Modify** `src/utils/supabase/database.types.ts` — add the column to plants Row/Insert/Update (controller, after migration).
- **Modify** `scripts/import-plants.ts` — Zod field + insert mapping.
- **Modify** `src/app/odlingsschema/[zon]/page.tsx` — pass `firstFrostDate`, select column, map field, label.
- **Modify** `src/app/gardens/[gardenId]/schedule/page.tsx` — derive autumn frost, pass to both calls, select column, map field.
- **Modify** `src/components/ScheduleView.tsx` — `KIND_LABELS` entry for `plant_autumn`.
- **Live DB** — `ALTER TABLE` via Supabase MCP (controller-run, not delegated).

Controller-run tasks (touch the live production DB): **Task 3** (migration + types) and **Task 8** (garlic data import). All others are safe to delegate.

---

## Task 1: Autumn branch in computeSchedule (TDD)

**Files:**
- Modify: `src/lib/plantSchedule.ts`
- Test: `src/lib/plantSchedule.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/plantSchedule.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule, type PlantScheduleInput } from './plantSchedule';

const garlic: PlantScheduleInput = {
  id: 'vitlok', commonName: 'Vitlök', emoji: '🧄',
  sowIndoorsDaysBeforeFrost: null, directSowDaysBeforeFrost: null, transplantDaysAfterFrost: null,
  daysToMaturityMin: 270, daysToMaturityMax: 300,
  autumnPlantDaysBeforeFirstFrost: 0,
};
const lastFrost = new Date(2026, 3, 15);  // 15 Apr 2026
const firstFrost = new Date(2026, 9, 15); // 15 Oct 2026

test('autumn crop: plant_autumn at first frost, harvest next summer', () => {
  const ev = computeSchedule(lastFrost, [garlic], firstFrost);
  const plant = ev.find((e) => e.kind === 'plant_autumn');
  assert.ok(plant, 'has a plant_autumn event');
  assert.equal(plant!.date.getMonth(), 9); // October
  const harvest = ev.find((e) => e.kind === 'harvest_start');
  assert.ok(harvest, 'has a harvest_start event');
  assert.equal(harvest!.date.getFullYear(), 2027); // next year
  assert.equal(harvest!.date.getMonth(), 6); // ~July (15 Oct + 270 d)
});

test('no firstFrostDate → no autumn events', () => {
  const ev = computeSchedule(lastFrost, [garlic]);
  assert.equal(ev.filter((e) => e.kind === 'plant_autumn').length, 0);
});

test('spring crop unaffected when firstFrostDate is supplied', () => {
  const carrot: PlantScheduleInput = {
    id: 'morot', commonName: 'Morot', emoji: '🥕',
    sowIndoorsDaysBeforeFrost: null, directSowDaysBeforeFrost: 14, transplantDaysAfterFrost: null,
    daysToMaturityMin: 70, daysToMaturityMax: 70, autumnPlantDaysBeforeFirstFrost: null,
  };
  const ev = computeSchedule(lastFrost, [carrot], firstFrost);
  assert.equal(ev.filter((e) => e.kind === 'plant_autumn').length, 0);
  assert.ok(ev.find((e) => e.kind === 'direct_sow'), 'still emits spring direct_sow');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/plantSchedule.test.ts`
Expected: FAIL — `autumnPlantDaysBeforeFirstFrost` not in type / no `plant_autumn` events.

- [ ] **Step 3: Edit `src/lib/plantSchedule.ts`**

3a. Add `"plant_autumn"` to the `ScheduleEventKind` union (after `"transplant"`):

```ts
export type ScheduleEventKind =
  | "sow_indoors"
  | "direct_sow"
  | "transplant"
  | "plant_autumn"
  | "harvest_start"
  | "harvest_end";
```

3b. Add the optional field to `PlantScheduleInput` (after `transplantDaysAfterFrost`):

```ts
  transplantDaysAfterFrost: number | null;
  autumnPlantDaysBeforeFirstFrost?: number | null;
```

3c. Change the signature to accept an optional autumn anchor:

```ts
export function computeSchedule(
  lastFrostDate: Date,
  plants: PlantScheduleInput[],
  firstFrostDate?: Date
): ScheduleEvent[] {
```

3d. At the top of the `for (const plant of plants)` loop body, right after `const base = {...}`, insert the autumn branch (returns early for autumn crops):

```ts
    if (plant.autumnPlantDaysBeforeFirstFrost != null && firstFrostDate) {
      const plantDate = addDays(firstFrostDate, -plant.autumnPlantDaysBeforeFirstFrost);
      events.push({ ...base, kind: "plant_autumn", date: plantDate, label: "Sätt på hösten" });
      if (plant.daysToMaturityMin != null) {
        events.push({ ...base, kind: "harvest_start", date: addDays(plantDate, plant.daysToMaturityMin), label: "Börja skörda" });
      }
      if (plant.daysToMaturityMax != null) {
        events.push({ ...base, kind: "harvest_end", date: addDays(plantDate, plant.daysToMaturityMax), label: "Sista skörd" });
      }
      continue;
    }
```

3e. Add a `KIND_STYLES` entry for `plant_autumn` (inside the `KIND_STYLES` object, after `transplant`):

```ts
  plant_autumn: {
    bg: "bg-lime-50",
    text: "text-lime-800",
    dot: "bg-lime-500",
  },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/plantSchedule.test.ts`
Expected: PASS — `# pass 3 # fail 0`.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` (expect clean — existing callers compile because the field/param are optional).

```bash
git add src/lib/plantSchedule.ts src/lib/plantSchedule.test.ts
git commit -m "feat(schedule): autumn-planted crop support in computeSchedule"
```

---

## Task 2: Zone autumn-frost helpers (TDD)

**Files:**
- Modify: `src/lib/zones.ts`
- Test: `src/lib/zones.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/zones.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstFrostDateForYear, firstFrostMDForLastFrostMD } from './zones';

test('firstFrostDateForYear parses MD into a Date', () => {
  const d = firstFrostDateForYear('10-15', 2026);
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 9); // October
  assert.equal(d.getDate(), 15);
});

test('firstFrostMDForLastFrostMD maps a spring MD to the nearest zone autumn frost', () => {
  // Z1 lastFrost 04-01 → firstFrost 11-01 ; Z2 lastFrost 04-15 → firstFrost 10-15
  assert.equal(firstFrostMDForLastFrostMD('04-01'), '11-01');
  assert.equal(firstFrostMDForLastFrostMD('04-15'), '10-15');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/zones.test.ts`
Expected: FAIL — helpers not exported.

- [ ] **Step 3: Append to `src/lib/zones.ts`**

```ts
/** Average first autumn frost as a Date for the given year (mirrors lastFrostDateForYear). */
export function firstFrostDateForYear(
  firstFrostMD: string,
  year = new Date().getFullYear()
): Date {
  const [month, day] = firstFrostMD.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Map a spring last-frost MD to the first autumn frost MD of the zone whose
 * spring frost is closest. Used by the personal garden schedule, which works
 * from a picked spring-frost date rather than a chosen zone.
 */
export function firstFrostMDForLastFrostMD(lastFrostMD: string): string {
  const score = (md: string) => {
    const [m, d] = md.split("-").map(Number);
    return m * 100 + d;
  };
  const target = score(lastFrostMD);
  let best = SWEDISH_ZONES[0];
  let bestDiff = Infinity;
  for (const z of SWEDISH_ZONES) {
    const diff = Math.abs(score(z.lastFrostMD) - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = z;
    }
  }
  return best.firstFrostMD;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/zones.test.ts`
Expected: PASS — `# pass 2 # fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/zones.ts src/lib/zones.test.ts
git commit -m "feat(zones): first-autumn-frost helpers"
```

---

## Task 3: Migration + regenerate types (CONTROLLER-RUN — touches live DB)

Do NOT delegate. Run in the main session with the Supabase MCP.

- [ ] **Step 1: Apply the migration via Supabase MCP `apply_migration`**

name: `add_autumn_plant_days_before_first_frost`
query:
```sql
alter table public.plants
  add column if not exists autumn_plant_days_before_first_frost integer;
comment on column public.plants.autumn_plant_days_before_first_frost is
  'Days before first autumn frost to set this crop (autumn-planted, harvested next summer). NULL = spring-planted.';
```

- [ ] **Step 2: Verify the column exists**

Via MCP `execute_sql`:
```sql
select column_name, data_type from information_schema.columns
where table_name = 'plants' and column_name = 'autumn_plant_days_before_first_frost';
```
Expected: one row, `integer`.

- [ ] **Step 3: Add the column to `src/utils/supabase/database.types.ts`**

In the `plants` table type, add to the `Row` block:
```ts
          autumn_plant_days_before_first_frost: number | null
```
and to both `Insert` and `Update` blocks:
```ts
          autumn_plant_days_before_first_frost?: number | null
```
(Keep alphabetical/positional consistency with surrounding fields. Alternatively regenerate via MCP `generate_typescript_types` and write the output to this file.)

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add src/utils/supabase/database.types.ts
git commit -m "feat(db): add autumn_plant_days_before_first_frost column"
```

---

## Task 4: Import schema support

**Files:**
- Modify: `scripts/import-plants.ts`

- [ ] **Step 1: Add the field to `PlantSchema`**

After the line `transplant_days_before_frost`/`transplant_days_after_frost: z.number().int().nullable().optional(),` in `PlantSchema`, add:
```ts
  autumn_plant_days_before_first_frost: z.number().int().nullable().optional(),
```

- [ ] **Step 2: Map it in `toPlantInsert`**

After `transplant_days_after_frost: p.transplant_days_after_frost ?? null,` add:
```ts
    autumn_plant_days_before_first_frost: p.autumn_plant_days_before_first_frost ?? null,
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add scripts/import-plants.ts
git commit -m "feat(import): accept autumn_plant_days_before_first_frost"
```

---

## Task 5: Wire the zone schedule page

**Files:**
- Modify: `src/app/odlingsschema/[zon]/page.tsx`

- [ ] **Step 1: Import the autumn-frost helper**

Change the zones import (line 7) to include `firstFrostDateForYear`:
```ts
import { SWEDISH_ZONES, lastFrostDateForYear, firstFrostDateForYear } from '@/lib/zones';
```

- [ ] **Step 2: Select the new column** — in the `.select(...)` string (line 71), append `, autumn_plant_days_before_first_frost` before the closing quote.

- [ ] **Step 3: Map it into `plantInputs`** — in the `.map(...)` (after `transplantDaysAfterFrost: p.transplant_days_after_frost,`) add:
```ts
      autumnPlantDaysBeforeFirstFrost: p.autumn_plant_days_before_first_frost,
```

- [ ] **Step 4: Pass the autumn anchor to computeSchedule** — replace lines 87–88:
```ts
  const frostDate = lastFrostDateForYear(zone.lastFrostMD, referenceYear);
  const firstFrostDate = firstFrostDateForYear(zone.firstFrostMD, referenceYear);
  const events = computeSchedule(frostDate, plantInputs, firstFrostDate);
```

- [ ] **Step 5: Add the label** — in the `KIND_LABELS` map (line 14) add after `transplant`:
```ts
  plant_autumn: 'Sätt på hösten',
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/odlingsschema/[zon]/page.tsx"
git commit -m "feat(schedule): show autumn planting on zone schedule pages"
```

---

## Task 6: Wire the personal garden schedule

**Files:**
- Modify: `src/app/gardens/[gardenId]/schedule/page.tsx`
- Modify: `src/components/ScheduleView.tsx`

- [ ] **Step 1: Import the nearest-zone autumn helper** in `schedule/page.tsx`. Add `firstFrostMDForLastFrostMD` and `firstFrostDateForYear` to the existing `@/lib/zones` import (if zones isn't imported there yet, add `import { firstFrostMDForLastFrostMD, firstFrostDateForYear } from '@/lib/zones';`).

- [ ] **Step 2: Select the new column** in BOTH plant `.select(...)` queries in this file (the planted-bed query and the all-catalog query), appending `, autumn_plant_days_before_first_frost`.

- [ ] **Step 3: Map it** into BOTH plant-input `.map(...)` blocks (the one near line 97 and the all-catalog one), adding after `transplantDaysAfterFrost: p.transplant_days_after_frost,`:
```ts
        autumnPlantDaysBeforeFirstFrost: p.autumn_plant_days_before_first_frost,
```

- [ ] **Step 4: Derive the autumn frost and pass it** — replace lines 125–126:
```ts
  const autumnMd = firstFrostMDForLastFrostMD(md);
  const thisYearEvents = computeSchedule(frostDateFor(now.getFullYear(), md), plantsForSchedule, firstFrostDateForYear(autumnMd, now.getFullYear()));
  const nextYearEvents = computeSchedule(frostDateFor(now.getFullYear() + 1, md), plantsForSchedule, firstFrostDateForYear(autumnMd, now.getFullYear() + 1));
```
Note: `md` is the spring-frost MM-DD already computed at line 121 via `frostMD(frostIsoForPicker)`. `firstFrostMDForLastFrostMD` expects `MM-DD`; if `frostMD` returns another format, convert to `MM-DD` first (read `frostMD` to confirm; it is used to feed `frostDateFor`, so it is month/day based).

- [ ] **Step 5: Add the label in `ScheduleView.tsx`** — in its `KIND_LABELS` map add after `transplant`:
```ts
  plant_autumn: 'Sätt på hösten',
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/gardens/[gardenId]/schedule/page.tsx" src/components/ScheduleView.tsx
git commit -m "feat(schedule): show autumn planting on personal garden schedule"
```

---

## Task 7: Full verification

- [ ] **Step 1: Run the whole suite + typecheck + lint on changed files**

```bash
npm test
npx tsc --noEmit
npx eslint src/lib/plantSchedule.ts src/lib/zones.ts "src/app/odlingsschema/[zon]/page.tsx" "src/app/gardens/[gardenId]/schedule/page.tsx" src/components/ScheduleView.tsx scripts/import-plants.ts
```
Expected: all tests pass, tsc clean, eslint clean on these files.

- [ ] **Step 2: Confirm no regression to spring scheduling** — the `plantSchedule.test.ts` "spring crop unaffected" test covers this; confirm it is green.

---

## Task 8: Garlic data via enrichment review (GATED — CONTROLLER-RUN, touches live DB)

Mechanism is live after Tasks 1–7; now fill garlic's actual values — sourced and reviewed, never invented.

- [ ] **Step 1: Source the values** per `data/plants/ENRICHMENT-PROMPT.md` — `autumn_plant_days_before_first_frost` (garlic is set around first frost; offset small) and clove-to-harvest `days_to_maturity_min/max` (~240–300 d), from approved sources (Impecta vitlök guide, etc.). Write `data/plants/vitlok.records.json`.

- [ ] **Step 2: Render the review report**

Run: `npx tsx scripts/enrich-report.ts data/plants/vitlok.records.json vitlok`
Expected: `✓ Wrote data/plants/review/vitlok.md (1 plants)`.

- [ ] **Step 3: Present to the user for ✓.** Stop here until approved.

- [ ] **Step 4: After approval — surgical UPDATE via Supabase MCP `execute_sql`**

```sql
update public.plants set
  autumn_plant_days_before_first_frost = <approved>,
  days_to_maturity_min = <approved>,
  days_to_maturity_max = <approved>
where slug = 'vitlok'
returning slug, autumn_plant_days_before_first_frost, days_to_maturity_min, days_to_maturity_max;
```
(Only fields the user approved; flagged/unsourced ones stay untouched.)

- [ ] **Step 5: Verify on the live zone schedule** — fetch `https://kvadratodling.se/odlingsschema/z1` and confirm a "Sätt på hösten" event for Vitlök appears in autumn and a harvest the following summer.

---

## Self-Review

**Spec coverage:** new column (Task 3) · computeSchedule autumn branch + `firstFrostDate` + `plant_autumn` kind + KIND_STYLES (Task 1) · `firstFrostDateForYear` + nearest-zone helper (Task 2) · all `computeSchedule` call sites + KIND_LABELS in both label maps (Tasks 5, 6) · import Zod + insert (Task 4) · migration via MCP (Task 3) · garlic data via review gate (Task 8) · tests (Tasks 1, 2, 7). All spec sections covered.

**Placeholder scan:** no TBD/TODO; all code shown; commands have expected output. The only conditional is Task 6 Step 4's note to confirm `frostMD`'s return format — the executor must read that one helper; format is MM-DD-compatible since it feeds `frostDateFor`.

**Type consistency:** `autumnPlantDaysBeforeFirstFrost` (camel, input type) vs `autumn_plant_days_before_first_frost` (snake, DB/Zod) used consistently per layer. `computeSchedule(lastFrostDate, plants, firstFrostDate?)` signature matches across Tasks 1, 5, 6. `plant_autumn` kind matches across plantSchedule, KIND_STYLES, and both KIND_LABELS maps.

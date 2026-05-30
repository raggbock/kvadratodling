# Planner Undo + Drag-to-Paint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bed planner fast and forgiving — pointer drag-to-paint across cells, and a multi-level undo that makes every edit safe to try.

**Architecture:** A pure action model (`CellChange[]` with before/after) routes every mutation — click, drag, preset, undo — through one `commit(changes)` in BedPlanner that applies optimistically, pushes to a capped undo stack, and persists via a bulk slots endpoint. The action core is extracted to a tested lib. Drag is pointer-only (mouse/pen); touch keeps tap-to-place.

**Tech Stack:** TypeScript, React 19, Next 16 route handlers, Supabase, Zod, `node:test` via `tsx` (`npm test`).

---

## File Structure

- **Create** `src/lib/plannerActions.ts` (+ `.test.ts`) — `SlotData`, `CellChange`, `Action` types + `applyChanges`, `invertChanges`, `pushAction`. Pure, tested.
- **Modify** `src/app/api/beds/[bedId]/slots/route.ts` — accept a `{ changes: [...] }` array (bulk upsert + delete).
- **Modify** `src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx` — central `commit()`, refactor click, drag handlers, undo stack + button + keyboard, preset registers an action. Import `SlotData` from the lib.

The four BedPlanner tasks (3–6) edit the same file in sequence — apply them in order.

---

## Task 1: Action core (TDD)

**Files:**
- Create: `src/lib/plannerActions.ts`
- Test: `src/lib/plannerActions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/plannerActions.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyChanges, invertChanges, pushAction, type SlotData, type Action } from './plannerActions';

const morot: SlotData = { row: 0, col: 0, plantSlug: 'morot', plantEmoji: '🥕', plantName: 'Morot' };

test('applyChanges sets and deletes cells', () => {
  const start = new Map<string, SlotData>();
  const changes: Action = [{ key: '0:0', before: null, after: morot }];
  const after = applyChanges(start, changes);
  assert.deepEqual(after.get('0:0'), morot);
  // start map is not mutated
  assert.equal(start.has('0:0'), false);

  const cleared = applyChanges(after, [{ key: '0:0', before: morot, after: null }]);
  assert.equal(cleared.has('0:0'), false);
});

test('invertChanges is an exact inverse (apply -> invert -> apply == original)', () => {
  const start = new Map<string, SlotData>([['0:0', morot]]);
  const changes: Action = [{ key: '0:0', before: morot, after: null }];
  const applied = applyChanges(start, changes);
  const back = applyChanges(applied, invertChanges(changes));
  assert.deepEqual(back.get('0:0'), morot);
});

test('pushAction caps the stack and drops the oldest', () => {
  let stack: Action[] = [];
  for (let i = 0; i < 25; i++) {
    stack = pushAction(stack, [{ key: `${i}:0`, before: null, after: morot }], 20);
  }
  assert.equal(stack.length, 20);
  // oldest (i=0..4) dropped; newest kept
  assert.equal(stack[stack.length - 1][0].key, '24:0');
  assert.equal(stack[0][0].key, '5:0');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test src/lib/plannerActions.test.ts`
Expected: FAIL — `Cannot find module './plannerActions'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/plannerActions.ts

export interface SlotData {
  row: number;
  col: number;
  plantSlug: string | null;
  plantEmoji: string | null;
  plantName: string | null;
}

/** One cell's before/after. `null` means the cell is empty. */
export interface CellChange {
  key: string; // "row:col"
  before: SlotData | null;
  after: SlotData | null;
}

export type Action = CellChange[];

/** Returns a NEW map with the changes' `after` values applied (does not mutate input). */
export function applyChanges(slots: Map<string, SlotData>, changes: Action): Map<string, SlotData> {
  const next = new Map(slots);
  for (const c of changes) {
    if (c.after === null) next.delete(c.key);
    else next.set(c.key, c.after);
  }
  return next;
}

/** Swaps before<->after on every change so applying the result undoes the action. */
export function invertChanges(changes: Action): Action {
  return changes.map((c) => ({ key: c.key, before: c.after, after: c.before }));
}

/** Pushes an action, keeping at most `cap` (default 20) by dropping the oldest. */
export function pushAction(stack: Action[], action: Action, cap = 20): Action[] {
  const next = [...stack, action];
  return next.length > cap ? next.slice(next.length - cap) : next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test src/lib/plannerActions.test.ts`
Expected: PASS — `# pass 3 # fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/plannerActions.ts src/lib/plannerActions.test.ts
git commit -m "feat(planner): action core for undo (applyChanges/invertChanges/pushAction)"
```

---

## Task 2: Bulk slots endpoint

Extend the slots PUT to accept an array of changes and apply them in a bulk upsert + delete. Single clicks send a one-element array.

**Files:**
- Modify: `src/app/api/beds/[bedId]/slots/route.ts`

- [ ] **Step 1: Replace the schema + PUT body of `route.ts`**

Replace the whole file contents with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ChangeSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  plantSlug: z.string().nullable(),
});
const BodySchema = z.object({ changes: z.array(ChangeSchema).min(1).max(400) });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    await requireUser();
    const supabase = await createClient();
    const { bedId } = await params;

    // RLS ensures the user owns the bed (via garden ownership).
    const { data: bed } = await supabase.from('beds').select('id').eq('id', bedId).single();
    if (!bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { changes } = BodySchema.parse(await req.json());

    const toDelete = changes.filter((c) => c.plantSlug === null);
    const toUpsert = changes.filter((c) => c.plantSlug !== null);

    // Resolve plant slugs -> ids in one query.
    const slugs = [...new Set(toUpsert.map((c) => c.plantSlug as string))];
    const slugToId = new Map<string, string>();
    if (slugs.length > 0) {
      const { data: plants } = await supabase.from('plants').select('id, slug').in('slug', slugs);
      for (const p of plants ?? []) slugToId.set(p.slug, p.id);
      const unknown = slugs.find((s) => !slugToId.has(s));
      if (unknown) return NextResponse.json({ error: `Unknown plant: ${unknown}` }, { status: 400 });
    }

    if (toUpsert.length > 0) {
      const now = new Date().toISOString();
      const rows = toUpsert.map((c) => ({
        bed_id: bedId,
        row: c.row,
        col: c.col,
        plant_id: slugToId.get(c.plantSlug as string)!,
        updated_at: now,
      }));
      const { error } = await supabase
        .from('planting_slots')
        .upsert(rows, { onConflict: 'bed_id,row,col' });
      if (error) throw error;
    }

    if (toDelete.length > 0) {
      // One delete per cell — idempotent; small batches in practice.
      const orFilter = toDelete.map((c) => `and(row.eq.${c.row},col.eq.${c.col})`).join(',');
      const { error } = await supabase
        .from('planting_slots')
        .delete()
        .eq('bed_id', bedId)
        .or(orFilter);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'api/beds/[id]/slots PUT');
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/beds/[bedId]/slots/route.ts"
git commit -m "feat(api): bulk slots PUT (array of changes, upsert + delete)"
```

---

## Task 3: Central commit + refactor click

Route the single-cell click through a shared `commit()` and the bulk endpoint. Introduce the undo stack and `persist` helper.

**Files:**
- Modify: `src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx`

- [ ] **Step 1: Import the lib + drop the local SlotData**

Add after the `findConflictCells` import:
```ts
import { applyChanges, invertChanges, pushAction, type SlotData, type Action } from '@/lib/plannerActions';
```
Then DELETE the local `interface SlotData { ... }` block (the one with `row/col/plantSlug/plantEmoji/plantName`) — it now comes from the lib.

- [ ] **Step 2: Add undo state**

After the line `const [saveError, setSaveError] = useState<string | null>(null);` add:
```ts
  const [undoStack, setUndoStack] = useState<Action[]>([]);
```

- [ ] **Step 3: Add `persist` + `commit` (the central mutation path)**

Insert these two callbacks immediately ABOVE the existing `const handleCellClick = useCallback(`:

```ts
  // Persist a set of changes via the bulk endpoint, marking the affected cells
  // pending. On failure: roll back the optimistic state and report the error.
  const persist = useCallback(
    async (changes: Action, onRollback: () => void) => {
      const keys = changes.map((c) => c.key);
      setPendingSaves((prev) => {
        const next = new Set(prev);
        for (const k of keys) next.add(k);
        return next;
      });
      try {
        const res = await fetch(`/api/beds/${bedId}/slots`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            changes: changes.map((c) => ({
              row: c.after?.row ?? c.before!.row,
              col: c.after?.col ?? c.before!.col,
              plantSlug: c.after?.plantSlug ?? null,
            })),
          }),
        });
        if (!res.ok) throw new Error('Save failed');
        setSavedAt(Date.now());
      } catch {
        onRollback();
        setSaveError('Kunde inte spara — kontrollera att du är online och försök igen.');
      } finally {
        setPendingSaves((prev) => {
          const next = new Set(prev);
          for (const k of keys) next.delete(k);
          return next;
        });
      }
    },
    [bedId],
  );

  // The single path every mutation goes through. Applies optimistically, pushes
  // to the undo stack (unless this IS an undo), and persists.
  const commit = useCallback(
    (changes: Action, opts: { pushUndo?: boolean } = {}) => {
      if (changes.length === 0) return;
      const pushUndo = opts.pushUndo ?? true;
      setSlots((prev) => applyChanges(prev, changes));
      if (pushUndo) setUndoStack((s) => pushAction(s, changes));
      setSaveError(null);
      void persist(changes, () => {
        setSlots((prev) => applyChanges(prev, invertChanges(changes)));
        if (pushUndo) setUndoStack((s) => s.slice(0, -1));
      });
    },
    [persist],
  );
```

- [ ] **Step 4: Rewrite `handleCellClick` to build a CellChange and commit**

Replace the ENTIRE existing `const handleCellClick = useCallback( ... );` block with:

```ts
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const key = `${row}:${col}`;
      const previous = slots.get(key) ?? null;
      const isSamePlant = previous?.plantSlug === selectedSlug;
      const newSlug = isSamePlant ? null : selectedSlug;
      const plant = newSlug ? paletteBySlug.get(newSlug) : null;
      const after: SlotData | null = newSlug
        ? { row, col, plantSlug: newSlug, plantEmoji: plant?.emoji ?? null, plantName: plant?.name ?? null }
        : null;
      if ((previous?.plantSlug ?? null) === (after?.plantSlug ?? null)) return; // no-op
      if (newSlug === null) track({ name: 'plant_removed', properties: { bed_id: bedId, row, col } });
      else track({ name: 'plant_added', properties: { plant_slug: newSlug, bed_id: bedId, row, col } });
      commit([{ key, before: previous, after }]);
    },
    [slots, selectedSlug, paletteBySlug, bedId, commit],
  );
```

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx"
git commit -m "refactor(planner): route clicks through commit() + bulk persist"
```

---

## Task 4: Drag-to-paint (pointer-only)

**Files:**
- Modify: `src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx`

Key idea: the drag PREVIEW only starts once the pointer enters a **second** cell. A plain click never previews, so it falls through to `onClick` (toggle) and keyboard Enter/Space still works. After a real drag, the synthetic click that follows `pointerup` is swallowed via a ref flag.

- [ ] **Step 1: Add `useRef` to the React import + `CellChange` to the lib import**

```ts
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
```
```ts
import { applyChanges, invertChanges, pushAction, type SlotData, type Action, type CellChange } from '@/lib/plannerActions';
```

- [ ] **Step 2: Add drag refs + handlers**

Insert ABOVE the `return (` of the component:

```ts
  // Pointer drag-to-paint (mouse/pen only — touch keeps tap-to-place to avoid
  // fighting the horizontal scroll wrapper). A drag applies the current mode
  // (paint selectedSlug, or erase when selectedSlug is null) to every cell.
  const dragRef = useRef<{ active: boolean; startKey: string | null; didDrag: boolean }>({
    active: false,
    startKey: null,
    didDrag: false,
  });
  const dragChanges = useRef<Map<string, CellChange>>(new Map());
  const suppressClick = useRef(false);

  // The mode-aware change for one cell (set selectedSlug, or clear when null).
  // Returns null when the cell already matches (no change to record).
  const paintChangeFor = useCallback(
    (row: number, col: number): CellChange | null => {
      const key = `${row}:${col}`;
      const previous = slots.get(key) ?? null;
      const plant = selectedSlug ? paletteBySlug.get(selectedSlug) : null;
      const after: SlotData | null = selectedSlug
        ? { row, col, plantSlug: selectedSlug, plantEmoji: plant?.emoji ?? null, plantName: plant?.name ?? null }
        : null;
      if ((previous?.plantSlug ?? null) === (after?.plantSlug ?? null)) return null;
      return { key, before: previous, after };
    },
    [slots, selectedSlug, paletteBySlug],
  );

  const startDrag = useCallback((row: number, col: number, e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0) return; // touch/non-primary → onClick handles it
    dragRef.current = { active: true, startKey: `${row}:${col}`, didDrag: false };
    dragChanges.current = new Map();
  }, []);

  const extendDrag = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || e.pointerType === 'touch') return;
      const key = `${row}:${col}`;
      if (!d.didDrag) {
        if (key === d.startKey) return; // still on the start cell — not a drag yet
        d.didDrag = true;
        const [sr, sc] = d.startKey!.split(':').map(Number);
        const startCh = paintChangeFor(sr, sc); // paint the start cell too
        if (startCh) {
          dragChanges.current.set(startCh.key, startCh);
          setSlots((p) => applyChanges(p, [startCh]));
        }
      }
      if (dragChanges.current.has(key)) return;
      const ch = paintChangeFor(row, col);
      if (ch) {
        dragChanges.current.set(key, ch);
        setSlots((p) => applyChanges(p, [ch])); // live preview
      }
    },
    [paintChangeFor],
  );

  // End the drag on window pointerup (even if released outside the grid).
  useEffect(() => {
    function end() {
      const d = dragRef.current;
      if (!d.active) return;
      d.active = false;
      if (!d.didDrag) return; // it was a click → leave it to onClick
      const changes = [...dragChanges.current.values()];
      dragChanges.current = new Map();
      suppressClick.current = true; // swallow the click that fires after pointerup
      // The preview already applied these; commit re-applies the same values
      // (idempotent), pushes the undo action, and persists.
      commit(changes);
      track({ name: 'plants_painted', properties: { bed_id: bedId, count: changes.length } });
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [commit, bedId]);
```

- [ ] **Step 3: Guard `handleCellClick` against the post-drag click**

At the VERY TOP of the `handleCellClick` callback body (added in Task 3), insert:
```ts
      if (suppressClick.current) { suppressClick.current = false; return; }
```
(Refs aren't reactive, so no dependency-array change is needed.)

- [ ] **Step 4: Wire the pointer handlers onto the cell button**

On the cell `<button>` (the one with `data-cell={key}`), add these props alongside the existing `onClick`:
```tsx
                  onPointerDown={(e) => startDrag(r, c, e)}
                  onPointerEnter={(e) => extendDrag(r, c, e)}
```

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx"
git commit -m "feat(planner): pointer drag-to-paint (mouse/pen)"
```

---

## Task 5: Undo (stack + button + keyboard)

**Files:**
- Modify: `src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx`

- [ ] **Step 1: Add the undo handler + keyboard shortcut**

Insert below `commit`:

```ts
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    commit(invertChanges(last), { pushUndo: false });
    track({ name: 'planner_undo', properties: { bed_id: bedId } });
  }, [undoStack, commit, bedId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo]);
```

- [ ] **Step 2: Add the "Ångra" button**

Find the toolbar row that contains the `<PresetMenu ... />` (it renders near `{filledCount} / {total} rutor planterade`). Immediately before the `<PresetMenu` element, add:

```tsx
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Ångra (Ctrl/Cmd+Z)"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-default px-3 py-1.5 text-sm font-medium text-text-default transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↩ Ångra
            </button>
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx"
git commit -m "feat(planner): multi-level undo (button + Ctrl/Cmd+Z)"
```

---

## Task 6: Preset registers an undo action

Make preset-apply undoable by recording the before/after of the cells it changes.

**Files:**
- Modify: `src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx`

- [ ] **Step 1: Push an action after a successful preset apply**

In `handleApplyPreset`, after the line `if (!res.ok) throw new Error('Preset apply failed');` and before the `track(...)`, add code that builds the action from the diff between `previous` and `next` and pushes it. Replace the body's success path so it reads:

```ts
        if (!res.ok) throw new Error('Preset apply failed');
        // Record the diff so the preset can be undone.
        const changes: Action = [];
        const keys = new Set<string>([...previous.keys(), ...next.keys()]);
        for (const key of keys) {
          const before = previous.get(key) ?? null;
          const after = next.get(key) ?? null;
          if ((before?.plantSlug ?? null) !== (after?.plantSlug ?? null)) {
            changes.push({ key, before, after });
          }
        }
        if (changes.length > 0) setUndoStack((s) => pushAction(s, changes));
        track({ name: 'preset_applied', properties: { preset_id: preset.id, bed_id: bedId, slot_count: newSlots.length } });
        setSavedAt(Date.now());
```

(Undoing a preset replays the diff through `commit(invertChanges(...), { pushUndo: false })`, which persists via the bulk slots endpoint — no preset endpoint needed for the undo.)

- [ ] **Step 2: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add "src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx"
git commit -m "feat(planner): make preset-apply undoable"
```

---

## Task 7: Full verification + interaction QA

- [ ] **Step 1: Suite + types + lint**

```bash
npm test
npx tsc --noEmit
npx eslint src/lib/plannerActions.ts "src/app/api/beds/[bedId]/slots/route.ts" "src/app/gardens/[gardenId]/beds/[bedId]/BedPlanner.tsx"
```
Expected: all tests pass (incl. the new `plannerActions` ones), tsc clean, eslint clean.

- [ ] **Step 2: Interaction QA via a temporary route**

Create `src/app/qa-planner/page.tsx` that mounts `BedPlanner` (default export) with mock props — a 4×4 bed, a palette of 3 plants, an antagonist pair in `companions`, and a couple of `initialSlots`. Run `npm run dev`, open `http://localhost:3000/qa-planner`, and verify by driving the page:
  - Drag across several empty cells with the mouse → all paint the selected plant in one gesture; release → one bulk `PUT /api/beds/qa/slots` request fires (check the network log).
  - Click "↩ Ångra" (and press Ctrl+Z) → the last action reverts; repeat steps back through several actions; button disables when the stack is empty.
  - Switch to "Raderingsläge" and drag → cells erase.
Then DELETE `src/app/qa-planner` and stop the dev server. Do NOT commit the temp route.

- [ ] **Step 3: Report**

Confirm tests/tsc/lint green and summarize the QA observations (drag, undo depth, erase-drag, single bulk request).

---

## Self-Review

**Spec coverage:** pointer-only drag + mode-aware (Task 4) · single-click toggle preserved (Task 3) · multi-level undo stack capped 20 + button + Ctrl/Cmd+Z, no redo (Tasks 1, 5) · bulk slots endpoint, atomic-ish upsert+delete (Task 2) · every mutation through `commit`, rollback + stack-pop on failure (Task 3) · preset undoable (Task 6) · action core extracted + tested (Task 1) · interaction QA via temp route (Task 7). All spec sections covered.

**Placeholder scan:** no TBD/TODO; full code in each code step; commands have expected output.

**Type consistency:** `SlotData`/`CellChange`/`Action` defined in Task 1 and imported everywhere after; `applyChanges(slots, changes)`, `invertChanges(changes)`, `pushAction(stack, action, cap)` signatures consistent across Tasks 1, 3, 4, 5, 6; `commit(changes, { pushUndo })` used consistently in Tasks 3–6; bulk body shape `{ changes: [{row,col,plantSlug}] }` matches between Task 2 (route) and Task 3 (`persist`).

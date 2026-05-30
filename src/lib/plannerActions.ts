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

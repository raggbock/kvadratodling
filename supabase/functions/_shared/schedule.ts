// Deno-compatible task computation. Mirrors src/lib/plantSchedule.ts but
// exposes a tasksInWindow function returning categorised buckets — what the
// digest email actually needs. Keep these two files in sync; the test in
// supabase/functions/_shared/schedule.test.ts pins the math.

export interface PlantInput {
  id: string;
  slug: string;
  commonName: string;
  emoji: string;
  sowIndoorsDaysBeforeFrost: number | null;
  directSowDaysBeforeFrost: number | null;
  transplantDaysAfterFrost: number | null;
  daysToMaturityMin: number | null;
  daysToMaturityMax: number | null;
}

export interface TaskItem {
  plantId: string;
  slug: string;
  commonName: string;
  emoji: string;
  date: string; // YYYY-MM-DD
  daysFromNow: number;
}

export interface TaskBucket {
  sow_indoors: TaskItem[];
  direct_sow: TaskItem[];
  transplant: TaskItem[];
  harvest_open: TaskItem[];
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  const aStart = new Date(a); aStart.setHours(0, 0, 0, 0);
  const bStart = new Date(b); bStart.setHours(0, 0, 0, 0);
  return Math.round((bStart.getTime() - aStart.getTime()) / msPerDay);
}

function inWindow(date: Date, from: Date, to: Date): boolean {
  return date.getTime() >= from.getTime() && date.getTime() < to.getTime();
}

/**
 * Returns tasks (sow indoors / direct sow / transplant / harvest opens)
 * that fall in [from, to). Half-open window.
 */
export function tasksInWindow(
  lastFrostDate: Date,
  plants: PlantInput[],
  from: Date,
  to: Date,
): TaskBucket {
  const buckets: TaskBucket = {
    sow_indoors: [],
    direct_sow: [],
    transplant: [],
    harvest_open: [],
  };

  const fromNorm = new Date(from); fromNorm.setHours(0, 0, 0, 0);
  const toNorm = new Date(to); toNorm.setHours(0, 0, 0, 0);

  for (const plant of plants) {
    const base = {
      plantId: plant.id,
      slug: plant.slug,
      commonName: plant.commonName,
      emoji: plant.emoji,
    };

    if (plant.sowIndoorsDaysBeforeFrost != null) {
      const d = addDays(lastFrostDate, -plant.sowIndoorsDaysBeforeFrost);
      if (inWindow(d, fromNorm, toNorm)) {
        buckets.sow_indoors.push({ ...base, date: toIso(d), daysFromNow: daysBetween(fromNorm, d) });
      }
    }

    let harvestBase: Date | null = null;

    if (plant.directSowDaysBeforeFrost != null) {
      const d = addDays(lastFrostDate, -plant.directSowDaysBeforeFrost);
      if (inWindow(d, fromNorm, toNorm)) {
        buckets.direct_sow.push({ ...base, date: toIso(d), daysFromNow: daysBetween(fromNorm, d) });
      }
      harvestBase = d;
    }

    if (plant.transplantDaysAfterFrost != null) {
      const d = addDays(lastFrostDate, plant.transplantDaysAfterFrost);
      if (inWindow(d, fromNorm, toNorm)) {
        buckets.transplant.push({ ...base, date: toIso(d), daysFromNow: daysBetween(fromNorm, d) });
      }
      harvestBase = d;
    }

    if (harvestBase && plant.daysToMaturityMin != null) {
      const d = addDays(harvestBase, plant.daysToMaturityMin);
      if (inWindow(d, fromNorm, toNorm)) {
        buckets.harvest_open.push({ ...base, date: toIso(d), daysFromNow: daysBetween(fromNorm, d) });
      }
    }
  }

  // Sort each bucket by date ascending — the email lists them chronologically
  for (const key of Object.keys(buckets) as (keyof TaskBucket)[]) {
    buckets[key].sort((a, b) => a.date.localeCompare(b.date));
  }

  return buckets;
}

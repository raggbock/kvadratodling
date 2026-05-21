export type ScheduleEventKind =
  | "sow_indoors"
  | "direct_sow"
  | "transplant"
  | "harvest_start"
  | "harvest_end";

export interface ScheduleEvent {
  plantId: string;
  plantName: string;
  emoji: string;
  kind: ScheduleEventKind;
  date: Date;
  label: string;
}

export interface PlantScheduleInput {
  id: string;
  commonName: string;
  emoji: string;
  sowIndoorsDaysBeforeFrost: number | null;
  directSowDaysBeforeFrost: number | null;
  transplantDaysAfterFrost: number | null;
  daysToMaturityMin: number | null;
  daysToMaturityMax: number | null;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function computeSchedule(
  lastFrostDate: Date,
  plants: PlantScheduleInput[]
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];

  for (const plant of plants) {
    const base = {
      plantId: plant.id,
      plantName: plant.commonName,
      emoji: plant.emoji,
    };

    if (plant.sowIndoorsDaysBeforeFrost != null) {
      events.push({
        ...base,
        kind: "sow_indoors",
        date: addDays(lastFrostDate, -plant.sowIndoorsDaysBeforeFrost),
        label: "Så inomhus",
      });
    }

    // directSowDaysBeforeFrost: positive = before frost, negative = after frost
    if (plant.directSowDaysBeforeFrost != null) {
      events.push({
        ...base,
        kind: "direct_sow",
        date: addDays(lastFrostDate, -plant.directSowDaysBeforeFrost),
        label: "Så utomhus",
      });
    }

    let harvestBaseDate: Date | null = null;

    if (plant.transplantDaysAfterFrost != null) {
      const transplantDate = addDays(lastFrostDate, plant.transplantDaysAfterFrost);
      events.push({
        ...base,
        kind: "transplant",
        date: transplantDate,
        label: "Plantera ut",
      });
      harvestBaseDate = transplantDate;
    } else if (plant.directSowDaysBeforeFrost != null) {
      harvestBaseDate = addDays(lastFrostDate, -plant.directSowDaysBeforeFrost);
    }

    if (harvestBaseDate) {
      if (plant.daysToMaturityMin != null) {
        events.push({
          ...base,
          kind: "harvest_start",
          date: addDays(harvestBaseDate, plant.daysToMaturityMin),
          label: "Börja skörda",
        });
      }
      if (plant.daysToMaturityMax != null) {
        events.push({
          ...base,
          kind: "harvest_end",
          date: addDays(harvestBaseDate, plant.daysToMaturityMax),
          label: "Sista skörd",
        });
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function groupEventsByMonth(
  events: ScheduleEvent[]
): Map<string, ScheduleEvent[]> {
  const groups = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const key = event.date.toLocaleString("sv-SE", {
      year: "numeric",
      month: "long",
    });
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return groups;
}

export const KIND_STYLES: Record<
  ScheduleEventKind,
  { bg: string; text: string; dot: string }
> = {
  sow_indoors: {
    bg: "bg-violet-50",
    text: "text-violet-800",
    dot: "bg-violet-400",
  },
  direct_sow: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    dot: "bg-sky-400",
  },
  transplant: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-emerald-400",
  },
  harvest_start: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-amber-400",
  },
  harvest_end: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    dot: "bg-orange-400",
  },
};

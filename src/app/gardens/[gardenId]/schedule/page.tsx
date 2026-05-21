import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeSchedule, PlantScheduleInput } from "@/lib/plantSchedule";
import { ScheduleView } from "@/components/ScheduleView";
import { CATALOG_PLANTS } from "@/data/plants";

// Default last-frost date for Swedish zone 3 (Stockholm area): May 1
function defaultFrostDate(): string {
  return `${new Date().getFullYear()}-05-01`;
}

function parseFrostDate(param: string | undefined): string {
  if (!param) return defaultFrostDate();
  const d = new Date(param);
  if (isNaN(d.getTime())) return defaultFrostDate();
  return param;
}

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface PageProps {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<{ frostDate?: string }>;
}

export default async function SchedulePage({ params, searchParams }: PageProps) {
  const { gardenId } = await params;
  const { frostDate: frostDateParam } = await searchParams;

  let gardenName = "Demo — alla växter";
  let plantsForSchedule: PlantScheduleInput[];
  let frostDateIso: string;

  if (gardenId === "demo") {
    frostDateIso = parseFrostDate(frostDateParam);
    // Use static catalog data so the demo works without a seeded DB
    plantsForSchedule = CATALOG_PLANTS.map((p, i) => ({
      id: p.slug,
      commonName: p.commonName,
      emoji: p.emoji,
      sowIndoorsDaysBeforeFrost: p.sowIndoorsDaysBeforeFrost,
      directSowDaysBeforeFrost: p.directSowDaysBeforeFrost,
      transplantDaysAfterFrost: p.transplantDaysAfterFrost,
      daysToMaturityMin: p.daysToMaturityMin,
      daysToMaturityMax: p.daysToMaturityMax,
    }));
  } else {
    const garden = await prisma.garden.findUnique({
      where: { id: gardenId },
      select: {
        id: true,
        name: true,
        lastFrostDate: true,
        beds: {
          select: {
            plantingSlots: {
              where: { plantId: { not: null } },
              select: {
                plant: {
                  select: {
                    id: true,
                    commonName: true,
                    emoji: true,
                    sowIndoorsDaysBeforeFrost: true,
                    directSowDaysBeforeFrost: true,
                    transplantDaysAfterFrost: true,
                    daysToMaturityMin: true,
                    daysToMaturityMax: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!garden) notFound();

    gardenName = garden.name;

    // Use garden's stored frost date unless user has overridden via URL
    if (frostDateParam) {
      frostDateIso = parseFrostDate(frostDateParam);
    } else if (garden.lastFrostDate) {
      frostDateIso = toIso(garden.lastFrostDate);
    } else {
      frostDateIso = defaultFrostDate();
    }

    // Deduplicate plants (same species can appear in multiple slots)
    const seen = new Set<string>();
    plantsForSchedule = garden.beds
      .flatMap((b) => b.plantingSlots)
      .filter((s) => s.plant !== null)
      .map((s) => s.plant!)
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      })
      .map((p) => ({
        ...p,
        sowIndoorsDaysBeforeFrost: p.sowIndoorsDaysBeforeFrost ?? null,
        directSowDaysBeforeFrost: p.directSowDaysBeforeFrost ?? null,
        transplantDaysAfterFrost: p.transplantDaysAfterFrost ?? null,
        daysToMaturityMin: p.daysToMaturityMin ?? null,
        daysToMaturityMax: p.daysToMaturityMax ?? null,
      }));
  }

  const events = computeSchedule(new Date(frostDateIso), plantsForSchedule);

  return (
    <ScheduleView
      gardenName={gardenName}
      frostDateIso={frostDateIso}
      events={events}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { gardenId } = await params;
  if (gardenId === "demo") {
    return { title: "Odlingsschema – Demo | Kvadratodling" };
  }
  return { title: "Odlingsschema | Kvadratodling" };
}

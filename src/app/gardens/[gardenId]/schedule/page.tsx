import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { computeSchedule, PlantScheduleInput } from "@/lib/plantSchedule";
import { ScheduleView } from "@/components/ScheduleView";

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

  const supabase = await createClient();

  if (gardenId === "demo") {
    frostDateIso = parseFrostDate(frostDateParam);
    // Demo mode shows the planting schedule for every active plant in the
    // catalog — same data source as /catalog, no per-user state.
    const { data: plants } = await supabase
      .from("plants")
      .select(
        "id, slug, common_name, emoji, sow_indoors_days_before_frost, direct_sow_days_before_frost, transplant_days_after_frost, days_to_maturity_min, days_to_maturity_max",
      )
      .eq("is_active", true)
      .order("common_name");
    plantsForSchedule = (plants ?? []).map((p) => ({
      id: p.slug,                          // use slug as id for demo — stable across reseeds
      commonName: p.common_name,
      emoji: p.emoji,
      sowIndoorsDaysBeforeFrost: p.sow_indoors_days_before_frost,
      directSowDaysBeforeFrost: p.direct_sow_days_before_frost,
      transplantDaysAfterFrost: p.transplant_days_after_frost,
      daysToMaturityMin: p.days_to_maturity_min,
      daysToMaturityMax: p.days_to_maturity_max,
    }));
  } else {
    const { data: garden } = await supabase
      .from("gardens")
      .select(`
        id, name, last_frost_date,
        beds(
          planting_slots(
            plant:plants(
              id, common_name, emoji,
              sow_indoors_days_before_frost,
              direct_sow_days_before_frost,
              transplant_days_after_frost,
              days_to_maturity_min,
              days_to_maturity_max
            )
          )
        )
      `)
      .eq("id", gardenId)
      .single();

    if (!garden) notFound();

    gardenName = garden.name;

    if (frostDateParam) {
      frostDateIso = parseFrostDate(frostDateParam);
    } else if (garden.last_frost_date) {
      frostDateIso = toIso(new Date(garden.last_frost_date));
    } else {
      frostDateIso = defaultFrostDate();
    }

    const seen = new Set<string>();
    plantsForSchedule = garden.beds
      .flatMap((b) => b.planting_slots)
      .filter((s) => s.plant !== null)
      .map((s) => s.plant!)
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      })
      .map((p) => ({
        id: p.id,
        commonName: p.common_name,
        emoji: p.emoji,
        sowIndoorsDaysBeforeFrost: p.sow_indoors_days_before_frost,
        directSowDaysBeforeFrost: p.direct_sow_days_before_frost,
        transplantDaysAfterFrost: p.transplant_days_after_frost,
        daysToMaturityMin: p.days_to_maturity_min,
        daysToMaturityMax: p.days_to_maturity_max,
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

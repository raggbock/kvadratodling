import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { computeSchedule, type PlantScheduleInput, type ScheduleEvent } from '@/lib/plantSchedule';
import { ScheduleView } from '@/components/ScheduleView';
import { firstFrostMDForLastFrostMD, firstFrostDateForYear } from '@/lib/zones';

const DEFAULT_FROST_MD = '05-01';

function frostMD(iso: string | null): string {
  if (!iso) return DEFAULT_FROST_MD;
  return iso.slice(5, 10); // "YYYY-MM-DD" -> "MM-DD"
}

function frostDateFor(year: number, md: string): Date {
  return new Date(`${year}-${md}T00:00:00`);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

interface PageProps {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<{ frostDate?: string; mode?: string }>;
}

export default async function SchedulePage({ params, searchParams }: PageProps) {
  const { gardenId } = await params;
  const { frostDate: frostDateParam, mode } = await searchParams;

  const supabase = await createClient();

  let gardenName = 'Demo — alla växter';
  let plantsForSchedule: PlantScheduleInput[];
  let frostIsoForPicker: string;
  let plantsAreFromBed = false;

  // Fetch all active plants once — used as a fallback whenever the bed
  // doesn't have its own selection (demo, brand-new garden, etc.).
  const { data: allPlants } = await supabase
    .from('plants')
    .select(
      'id, slug, common_name, emoji, sow_indoors_days_before_frost, direct_sow_days_before_frost, transplant_days_after_frost, days_to_maturity_min, days_to_maturity_max, autumn_plant_days_before_first_frost',
    )
    .eq('is_active', true)
    .order('common_name');

  const allPlantsForSchedule: PlantScheduleInput[] = (allPlants ?? []).map((p) => ({
    id: p.slug,
    commonName: p.common_name,
    emoji: p.emoji,
    sowIndoorsDaysBeforeFrost: p.sow_indoors_days_before_frost,
    directSowDaysBeforeFrost: p.direct_sow_days_before_frost,
    transplantDaysAfterFrost: p.transplant_days_after_frost,
    autumnPlantDaysBeforeFirstFrost: p.autumn_plant_days_before_first_frost,
    daysToMaturityMin: p.days_to_maturity_min,
    daysToMaturityMax: p.days_to_maturity_max,
  }));

  if (gardenId === 'demo') {
    frostIsoForPicker = frostDateParam ?? `${new Date().getFullYear()}-${DEFAULT_FROST_MD}`;
    plantsForSchedule = allPlantsForSchedule;
  } else {
    const { data: garden } = await supabase
      .from('gardens')
      .select(`
        id, name, last_frost_date,
        beds(planting_slots(plant:plants(id, common_name, emoji,
          sow_indoors_days_before_frost, direct_sow_days_before_frost,
          transplant_days_after_frost, days_to_maturity_min, days_to_maturity_max, autumn_plant_days_before_first_frost)))
      `)
      .eq('id', gardenId)
      .single();
    if (!garden) notFound();

    gardenName = garden.name;
    frostIsoForPicker = frostDateParam
      ?? (garden.last_frost_date ? toIso(new Date(garden.last_frost_date)) : `${new Date().getFullYear()}-${DEFAULT_FROST_MD}`);

    // Plants that are actually planted in this garden
    const seen = new Set<string>();
    const planted: PlantScheduleInput[] = garden.beds
      .flatMap((b) => b.planting_slots)
      .filter((s) => s.plant !== null)
      .map((s) => s.plant!)
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .map((p) => ({
        id: p.id,
        commonName: p.common_name,
        emoji: p.emoji,
        sowIndoorsDaysBeforeFrost: p.sow_indoors_days_before_frost,
        directSowDaysBeforeFrost: p.direct_sow_days_before_frost,
        transplantDaysAfterFrost: p.transplant_days_after_frost,
        autumnPlantDaysBeforeFirstFrost: p.autumn_plant_days_before_first_frost,
        daysToMaturityMin: p.days_to_maturity_min,
        daysToMaturityMax: p.days_to_maturity_max,
      }));

    if (planted.length > 0 && mode !== 'catalog') {
      plantsForSchedule = planted;
      plantsAreFromBed = true;
    } else {
      // Empty garden (no beds planted yet) — show the full-catalog schedule so
      // the user can see what they could be doing right now, before planning beds.
      plantsForSchedule = allPlantsForSchedule;
    }
  }

  // Compute events across the next 12 months by combining this year's frost
  // date with next year's, then filter to [today, today+365). This keeps
  // sow-indoors events that belong to early next spring visible.
  const md = frostMD(frostIsoForPicker);
  const now = startOfDay(new Date());
  const windowEnd = addDays(now, 365);

  const autumnMd = firstFrostMDForLastFrostMD(md);
  const thisYearEvents = computeSchedule(frostDateFor(now.getFullYear(), md), plantsForSchedule, firstFrostDateForYear(autumnMd, now.getFullYear()));
  const nextYearEvents = computeSchedule(frostDateFor(now.getFullYear() + 1, md), plantsForSchedule, firstFrostDateForYear(autumnMd, now.getFullYear() + 1));
  const events: ScheduleEvent[] = [...thisYearEvents, ...nextYearEvents]
    .filter((e) => e.date >= now && e.date < windowEnd)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ScheduleView
      gardenId={gardenId}
      gardenName={gardenName}
      frostDateIso={frostIsoForPicker}
      events={events}
      plantsAreFromBed={plantsAreFromBed}
      catalogModeForced={mode === 'catalog'}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { gardenId } = await params;
  return {
    title:
      gardenId === 'demo'
        ? 'Odlingsschema – Demo | Kvadratodling'
        : 'Odlingsschema | Kvadratodling',
  };
}

// Display helpers for DB-shaped plant rows. Centralized so /catalog,
// /catalog/[slug] and the bed planner share the same labels.
import type { Database } from '@/utils/supabase/database.types';

export type SunRequirement = Database['public']['Enums']['sun_requirement'];
export type WaterNeed = Database['public']['Enums']['water_need'];

export const SUN_LABELS: Record<SunRequirement, string> = {
  full_sun: 'Full sol',
  part_shade: 'Halvskugga',
  full_shade: 'Skugga',
};

export const SUN_ICONS: Record<SunRequirement, string> = {
  full_sun: '☀️',
  part_shade: '⛅',
  full_shade: '🌥️',
};

export const WATER_LABELS: Record<WaterNeed, string> = {
  low: 'Låg',
  medium: 'Medel',
  high: 'Hög',
};

export const WATER_ICONS: Record<WaterNeed, string> = {
  low: '💧',
  medium: '💧💧',
  high: '💧💧💧',
};

/** Returns "70 d" or "60–90 d" or null if both bounds missing. */
export function formatDaysToHarvest(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `${min}–${max} d`;
  return `${min ?? max} d`;
}

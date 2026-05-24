import Link from 'next/link';
import type { Tables } from '@/utils/supabase/database.types';
import { SUN_ICONS, SUN_LABELS, WATER_ICONS, WATER_LABELS, formatDaysToHarvest } from '@/lib/plant-display';

// The minimum shape the card needs — keeps queries lean.
export type PlantCardPlant = Pick<
  Tables<'plants'>,
  | 'slug'
  | 'common_name'
  | 'english_name'
  | 'emoji'
  | 'plants_per_sqft'
  | 'sun_requirement'
  | 'water_need'
  | 'days_to_maturity_min'
  | 'days_to_maturity_max'
  | 'description'
  | 'tags'
>;

export function PlantCard({ plant }: { plant: PlantCardPlant }) {
  const days = formatDaysToHarvest(plant.days_to_maturity_min, plant.days_to_maturity_max);

  return (
    <Link
      href={`/catalog/${plant.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-400 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-3xl" aria-hidden>
          {plant.emoji}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {plant.plants_per_sqft} per ruta
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
        {plant.common_name}
      </h3>
      {plant.english_name && <p className="text-xs text-gray-400">{plant.english_name}</p>}

      {plant.description && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{plant.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span title={SUN_LABELS[plant.sun_requirement]}>
          {SUN_ICONS[plant.sun_requirement]} {SUN_LABELS[plant.sun_requirement]}
        </span>
        <span title={`Vatten: ${WATER_LABELS[plant.water_need]}`}>
          {WATER_ICONS[plant.water_need]} {WATER_LABELS[plant.water_need]}
        </span>
        {days && <span>⏱ {days}</span>}
      </div>

      {plant.tags && plant.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {plant.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

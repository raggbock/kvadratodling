import Link from 'next/link';
import type { Plant } from '@/lib/plants';
import { SUN_ICONS, SUN_LABELS, WATER_ICONS, WATER_LABELS } from '@/lib/plants';

interface Props {
  plant: Plant;
}

export function PlantCard({ plant }: Props) {
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
          {plant.plantsPerSquare === 1
            ? '1 per square'
            : `${plant.plantsPerSquare} per square`}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
        {plant.name}
      </h3>
      <p className="text-xs text-gray-400">{plant.nameSv}</p>

      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{plant.description}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span title={SUN_LABELS[plant.sunRequirement]}>
          {SUN_ICONS[plant.sunRequirement]} {SUN_LABELS[plant.sunRequirement]}
        </span>
        <span title={`Water: ${WATER_LABELS[plant.waterRequirement]}`}>
          {WATER_ICONS[plant.waterRequirement]} Water
        </span>
        <span>⏱ {plant.daysToHarvest}d</span>
      </div>

      {plant.tags.length > 0 && (
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

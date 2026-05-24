'use client';

import { useState, useMemo } from 'react';
import { SUN_LABELS, WATER_LABELS, type SunRequirement, type WaterNeed } from '@/lib/plant-display';
import { PlantCard, type PlantCardPlant } from '@/components/PlantCard';

type SunFilter = SunRequirement | '';
type WaterFilter = WaterNeed | '';

const SUN_OPTIONS: { value: SunFilter; label: string }[] = [
  { value: '', label: 'Alla sollägen' },
  { value: 'full_sun', label: SUN_LABELS.full_sun },
  { value: 'part_shade', label: SUN_LABELS.part_shade },
  { value: 'full_shade', label: SUN_LABELS.full_shade },
];

const WATER_OPTIONS: { value: WaterFilter; label: string }[] = [
  { value: '', label: 'Alla vattenbehov' },
  { value: 'low', label: WATER_LABELS.low },
  { value: 'medium', label: WATER_LABELS.medium },
  { value: 'high', label: WATER_LABELS.high },
];

export function CatalogClient({ plants }: { plants: PlantCardPlant[] }) {
  const [query, setQuery] = useState('');
  const [sun, setSun] = useState<SunFilter>('');
  const [water, setWater] = useState<WaterFilter>('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return plants.filter((p) => {
      if (q) {
        const haystack = [p.common_name, p.english_name ?? '', ...(p.tags ?? [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (sun && p.sun_requirement !== sun) return false;
      if (water && p.water_need !== water) return false;
      return true;
    });
  }, [plants, query, sun, water]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Sök växter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
        />
        <select
          value={sun}
          onChange={(e) => setSun(e.target.value as SunFilter)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-400 focus:outline-none"
        >
          {SUN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={water}
          onChange={(e) => setWater(e.target.value as WaterFilter)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-400 focus:outline-none"
        >
          {WATER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'växt' : 'växter'}
        {(query || sun || water) && ' matchar'}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          Inga växter matchar dina filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((plant) => (
            <PlantCard key={plant.slug} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}

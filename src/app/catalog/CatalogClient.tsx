'use client';

import { useState, useMemo } from 'react';
import type { Plant, SunRequirement, WaterRequirement } from '@/lib/plants';
import { SUN_LABELS, WATER_LABELS } from '@/lib/plants';
import { PlantCard } from '@/components/PlantCard';

interface Props {
  plants: Plant[];
}

const SUN_OPTIONS: { value: SunRequirement | ''; label: string }[] = [
  { value: '', label: 'Any sun' },
  { value: 'full', label: SUN_LABELS.full },
  { value: 'partial', label: SUN_LABELS.partial },
  { value: 'shade', label: SUN_LABELS.shade },
];

const WATER_OPTIONS: { value: WaterRequirement | ''; label: string }[] = [
  { value: '', label: 'Any water' },
  { value: 'low', label: WATER_LABELS.low },
  { value: 'medium', label: WATER_LABELS.medium },
  { value: 'high', label: WATER_LABELS.high },
];

export function CatalogClient({ plants }: Props) {
  const [query, setQuery] = useState('');
  const [sun, setSun] = useState<SunRequirement | ''>('');
  const [water, setWater] = useState<WaterRequirement | ''>('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return plants.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.nameSv.toLowerCase().includes(q) && !p.tags.some((t) => t.includes(q))) {
        return false;
      }
      if (sun && p.sunRequirement !== sun) return false;
      if (water && p.waterRequirement !== water) return false;
      return true;
    });
  }, [plants, query, sun, water]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search plants…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
        />
        <select
          value={sun}
          onChange={(e) => setSun(e.target.value as SunRequirement | '')}
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
          onChange={(e) => setWater(e.target.value as WaterRequirement | '')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-400 focus:outline-none"
        >
          {WATER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-gray-500">
        {filtered.length} plant{filtered.length !== 1 ? 's' : ''}
        {(query || sun || water) && ' matching filters'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          No plants match your filters.
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

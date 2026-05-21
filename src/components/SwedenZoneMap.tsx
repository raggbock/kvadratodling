'use client';

import { SWEDISH_ZONES } from '@/lib/zones';

interface Props {
  selectedZoneId: string;
  onZoneSelect: (id: string) => void;
}

// Simplified polygons representing Swedish growing zones in a 200×545 viewBox.
// North is top, south is bottom. Z2 (west coast) and Z3 (south-central) share
// the same latitude band and are split by longitude (~x=93).
const ZONE_PATHS: Record<string, string> = {
  Z8: 'M 35 8 L 130 5 L 162 112 L 30 112 Z',
  Z7: 'M 30 112 L 162 112 L 163 228 L 28 228 Z',
  Z6: 'M 28 228 L 163 228 L 158 290 L 28 290 Z',
  Z5: 'M 28 290 L 158 290 L 155 345 L 40 345 Z',
  Z4: 'M 40 345 L 155 345 L 152 400 L 42 400 Z',
  Z2: 'M 42 400 L 93 400 L 90 465 L 55 465 Z',
  Z3: 'M 93 400 L 152 400 L 138 465 L 90 465 Z',
  Z1: 'M 55 465 L 138 465 L 118 535 L 75 538 Z',
};

// Warm-to-cool palette: Z1 (warmest) → Z8 (coldest)
const BASE_FILL: Record<string, string> = {
  Z1: '#fef9c3',
  Z2: '#dcfce7',
  Z3: '#bbf7d0',
  Z4: '#6ee7b7',
  Z5: '#a5f3fc',
  Z6: '#bfdbfe',
  Z7: '#c7d2fe',
  Z8: '#ede9fe',
};

const SELECTED_FILL: Record<string, string> = {
  Z1: '#ca8a04',
  Z2: '#16a34a',
  Z3: '#15803d',
  Z4: '#059669',
  Z5: '#0891b2',
  Z6: '#2563eb',
  Z7: '#4338ca',
  Z8: '#7c3aed',
};

// Approximate centroid positions for zone labels
const LABEL_POS: Record<string, [number, number]> = {
  Z8: [82,  62],
  Z7: [95, 175],
  Z6: [95, 263],
  Z5: [93, 321],
  Z4: [97, 376],
  Z2: [66, 436],
  Z3: [119, 436],
  Z1: [97, 503],
};

export function SwedenZoneMap({ selectedZoneId, onZoneSelect }: Props) {
  return (
    <svg
      viewBox="0 0 200 545"
      className="w-full select-none"
      role="group"
      aria-label="Karta med odlingszoner i Sverige"
    >
      {SWEDISH_ZONES.map((zone) => {
        const d = ZONE_PATHS[zone.id];
        if (!d) return null;
        const selected = zone.id === selectedZoneId;
        const [lx, ly] = LABEL_POS[zone.id] ?? [100, 300];
        return (
          <g
            key={zone.id}
            role="button"
            tabIndex={0}
            aria-label={`Zon ${zone.id}: ${zone.nameSv}`}
            aria-pressed={selected}
            onClick={() => onZoneSelect(zone.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneSelect(zone.id);
              }
            }}
            className="cursor-pointer focus:outline-none"
          >
            <path
              d={d}
              fill={selected ? (SELECTED_FILL[zone.id] ?? '#16a34a') : (BASE_FILL[zone.id] ?? '#e5e7eb')}
              stroke={selected ? '#1e3a8a' : '#9ca3af'}
              strokeWidth={selected ? 2.5 : 0.8}
              strokeLinejoin="round"
            />
            <text
              x={lx}
              y={ly}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={selected ? '#fff' : '#374151'}
              pointerEvents="none"
            >
              {zone.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

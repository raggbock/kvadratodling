'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SwedenZoneMap } from '@/components/SwedenZoneMap';
import type { SwedishZone } from '@/lib/zones';

const MONTH_SV = [
  'januari','februari','mars','april','maj','juni',
  'juli','augusti','september','oktober','november','december',
];

function frostDateLabel(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

function startSowingHint(md: string): string {
  // 8 weeks before last frost = sow indoors window starts
  const [, m, d] = md.split('-').map(Number);
  const lastFrost = new Date(2026, m - 1, d); // use a leap-safe year, only month/day matter
  const sowStart = new Date(lastFrost);
  sowStart.setDate(sowStart.getDate() - 56);
  return `${sowStart.getDate()} ${MONTH_SV[sowStart.getMonth()]}`;
}

export function FrostCalculator({ zones }: { zones: SwedishZone[] }) {
  const [zoneId, setZoneId] = useState<string>('');
  const zone = zones.find((z) => z.id === zoneId);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-[200px_1fr] items-start">
        <div>
          <SwedenZoneMap selectedZoneId={zoneId} onZoneSelect={setZoneId} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Eller välj från listan
          </label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">— Välj din region —</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.id}: {z.nameSv} ({z.cities.slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {zone && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-bold text-green-900">
              <span className="mr-2 inline-block rounded bg-green-200 px-2 py-0.5 text-sm">{zone.id}</span>
              {zone.nameSv}
            </h2>
            <p className="text-sm text-green-700">{zone.cities.slice(0, 4).join(' · ')}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Sista frost</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{frostDateLabel(zone.lastFrostMD)}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Frostfria dagar</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{zone.frostFreeDays}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-400">Försådd börjar</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{startSowingHint(zone.lastFrostMD)}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-green-900">{zone.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/odlingsschema/${zone.id.toLowerCase()}`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Se komplett schema för {zone.id} →
            </Link>
            <Link
              href="/gardens/new"
              className="rounded-md border border-green-600 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Skapa odling med denna zon
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

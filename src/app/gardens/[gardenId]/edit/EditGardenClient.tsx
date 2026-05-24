'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SWEDISH_ZONES, lastFrostDateForYear } from '@/lib/zones';
import { SwedenZoneMap } from '@/components/SwedenZoneMap';
import { computeOptimalBeds, summarizeBedSizes } from '@/lib/bedLayout';

const MONTH_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

function frostDateLabel(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

interface Garden {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  lastFrostDate: Date | string | null;
  widthCm: number | null;
  lengthCm: number | null;
}

export function EditGardenClient({ garden }: { garden: Garden }) {
  const router = useRouter();
  const gardenId = garden.id;

  const initialFrost = garden.lastFrostDate
    ? new Date(garden.lastFrostDate).toISOString().slice(0, 10)
    : '';

  const [name, setName] = useState(garden.name);
  const [description, setDescription] = useState(garden.description ?? '');
  const [location, setLocation] = useState(garden.location ?? '');
  const [zoneId, setZoneId] = useState('');
  const [lastFrostDate, setLastFrostDate] = useState(initialFrost);
  const [widthM, setWidthM] = useState(garden.widthCm ? String(garden.widthCm / 100) : '');
  const [lengthM, setLengthM] = useState(garden.lengthCm ? String(garden.lengthCm / 100) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleZoneChange(id: string) {
    setZoneId(id);
    if (!id) return;
    const zone = SWEDISH_ZONES.find((z) => z.id === id);
    if (!zone) return;
    if (!location) setLocation(zone.nameSv);
    const d = lastFrostDateForYear(zone.lastFrostMD);
    setLastFrostDate(d.toISOString().slice(0, 10));
  }

  const layout = useMemo(() => {
    const w = parseFloat(widthM);
    const l = parseFloat(lengthM);
    if (!w || !l || w <= 0 || l <= 0) return null;
    return computeOptimalBeds(Math.round(w * 100), Math.round(l * 100));
  }, [widthM, lengthM]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const w = parseFloat(widthM);
      const l = parseFloat(lengthM);
      const res = await fetch(`/api/gardens/${gardenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          location: location || null,
          lastFrostDate: lastFrostDate || null,
          widthCm: w > 0 ? Math.round(w * 100) : null,
          lengthCm: l > 0 ? Math.round(l * 100) : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update garden');
      router.push(`/gardens/${gardenId}`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const selectedZone = SWEDISH_ZONES.find((z) => z.id === zoneId);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-2 text-sm text-gray-500">
        <Link href={`/gardens/${gardenId}`} className="hover:text-green-700">
          {garden.name}
        </Link>{' '}
        /
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit garden</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Garden name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Dimensions */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Plot size (meters)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.3"
              max="100"
              step="0.1"
              value={widthM}
              onChange={(e) => setWidthM(e.target.value)}
              placeholder="Bredd"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <span className="shrink-0 text-gray-400">×</span>
            <input
              type="number"
              min="0.3"
              max="100"
              step="0.1"
              value={lengthM}
              onChange={(e) => setLengthM(e.target.value)}
              placeholder="Längd"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {layout && layout.beds.length > 0 && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800">
                Optimerat layout: {layout.beds.length} odlingslåda{layout.beds.length !== 1 ? 'r' : ''}
              </p>
              <p className="mt-0.5 text-xs text-green-700">
                {summarizeBedSizes(layout.beds).map((g) => `${g.count} à ${g.size} cm`).join(' + ')}
              </p>
              <p className="mt-0.5 text-xs text-green-600">
                Totalt: {layout.beds.reduce((s, b) => s + b.rows * b.cols, 0)} odlingsrutor à 30×30 cm
              </p>
            </div>
          )}
        </div>

        {/* Zone picker */}
        <div>
          <p className="mb-2 block text-sm font-medium text-gray-700">
            Growing zone — click your region on the map
          </p>
          <div className="flex items-start gap-4">
            <div className="w-28 shrink-0 sm:w-36">
              <SwedenZoneMap selectedZoneId={zoneId} onZoneSelect={handleZoneChange} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              {selectedZone ? (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedZone.id}: {selectedZone.nameSv}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {selectedZone.description}
                  </p>
                  <div className="space-y-0.5 text-xs text-gray-400">
                    <p>Sista frost: ~{frostDateLabel(selectedZone.lastFrostMD)}</p>
                    <p>Frostfria dagar: ~{selectedZone.frostFreeDays}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Click your region to update frost date.
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label className="sr-only">Select growing zone</label>
            <select
              value={zoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">— Select your region in Sweden —</option>
              {SWEDISH_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.id}: {z.nameSv} ({z.cities.slice(0, 3).join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Last frost date
          </label>
          <input
            type="date"
            value={lastFrostDate}
            onChange={(e) => setLastFrostDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/gardens/${gardenId}`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

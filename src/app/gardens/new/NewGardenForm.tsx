'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SWEDISH_ZONES, lastFrostDateForYear } from '@/lib/zones';
import { SwedenZoneMap } from '@/components/SwedenZoneMap';
import { computeOptimalBeds, summarizeBedSizes } from '@/lib/bedLayout';
import { track } from '@/lib/analytics';

const MONTH_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

function frostDateLabel(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

export default function NewGardenForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [lastFrostDate, setLastFrostDate] = useState('');
  const [widthM, setWidthM] = useState('');
  const [lengthM, setLengthM] = useState('');
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
      const res = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          location: location || undefined,
          lastFrostDate: lastFrostDate || undefined,
          widthCm: w > 0 ? Math.round(w * 100) : undefined,
          lengthCm: l > 0 ? Math.round(l * 100) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create garden');
      const garden = await res.json();
      track({ name: 'garden_created', properties: { has_dimensions: !!(garden.width_cm && garden.length_cm) } });
      router.push(`/gardens/${garden.id}`);
    } catch {
      setError('Något gick fel. Försök igen.');
      setLoading(false);
    }
  }

  const selectedZone = SWEDISH_ZONES.find((z) => z.id === zoneId);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Ny odling</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Namn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="t.ex. Pallkrage på altanen"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Beskrivning</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Valfri beskrivning"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Dimensions */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Storlek på din yta
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0.3"
                max="100"
                step="0.1"
                value={widthM}
                onChange={(e) => setWidthM(e.target.value)}
                placeholder="Bredd"
                aria-label="Bredd i meter"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                m
              </span>
            </div>
            <span className="shrink-0 text-gray-400">×</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="0.3"
                max="100"
                step="0.1"
                value={lengthM}
                onChange={(e) => setLengthM(e.target.value)}
                placeholder="Längd"
                aria-label="Längd i meter"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                m
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Ange ytan i meter (0,3–100). Odlingslådor räknas ut automatiskt när du öppnar odlingen.
          </p>

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

          {layout && layout.beds.length === 0 && widthM && lengthM && (
            <p className="mt-2 text-xs text-amber-600">
              Ytan är för liten för en standardlåda (min 120 × 30 cm). Försök med större mått.
            </p>
          )}
        </div>

        {/* Zone picker */}
        <div>
          <p className="mb-2 block text-sm font-medium text-gray-700">
            Odlingszon — klicka din region på kartan
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
                    <p className="text-gray-300">{selectedZone.cities.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Klicka din region på kartan, eller välj från listan nedanför.
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label className="sr-only">Välj odlingszon</label>
            <select
              value={zoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">— Välj din region —</option>
              {SWEDISH_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.id}: {z.nameSv} ({z.cities.slice(0, 3).join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Plats</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="t.ex. Stockholm"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Sista frostdag
          </label>
          <input
            type="date"
            value={lastFrostDate}
            onChange={(e) => setLastFrostDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Fylls i automatiskt när du väljer en odlingszon. Du kan ändra den.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Skapar…' : 'Skapa odling'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}

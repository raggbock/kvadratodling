'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SWEDISH_ZONES, lastFrostDateForYear } from '@/lib/zones';

export default function NewGardenPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [lastFrostDate, setLastFrostDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleZoneChange(id: string) {
    setZoneId(id);
    if (!id) return;
    const zone = SWEDISH_ZONES.find((z) => z.id === id);
    if (!zone) return;
    // Pre-fill location from zone name if user hasn't typed anything
    if (!location) setLocation(zone.nameSv);
    // Pre-fill last frost date for current year
    const d = lastFrostDateForYear(zone.lastFrostMD);
    setLastFrostDate(d.toISOString().slice(0, 10));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          location,
          lastFrostDate: lastFrostDate || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create garden');
      const garden = await res.json();
      router.push(`/gardens/${garden.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const selectedZone = SWEDISH_ZONES.find((z) => z.id === zoneId);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New garden</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Garden name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Backyard garden"
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
            placeholder="Optional description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Growing zone
          </label>
          <select
            value={zoneId}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">— Select your region in Sweden —</option>
            {SWEDISH_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nameSv} ({z.cities.slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
          {selectedZone && (
            <p className="mt-1 text-xs text-gray-500">
              {selectedZone.description} Season: ~{selectedZone.frostFreeDays} frost-free days.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Stockholm, Sweden"
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
          <p className="mt-1 text-xs text-gray-400">
            Auto-filled when you pick a growing zone. You can override it.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create garden'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

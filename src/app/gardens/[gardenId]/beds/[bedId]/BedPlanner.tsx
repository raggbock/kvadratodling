'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { track } from '@/lib/analytics';

interface PalettePlant {
  slug: string;
  name: string;
  emoji: string;
}

interface SlotData {
  row: number;
  col: number;
  plantSlug: string | null;
  plantEmoji: string | null;
  plantName: string | null;
}

interface BedPlannerProps {
  bedId: string;
  rows: number;
  cols: number;
  initialSlots: SlotData[];
  palette: PalettePlant[];
}

export default function BedPlanner({ bedId, rows, cols, initialSlots, palette }: BedPlannerProps) {
  const [slots, setSlots] = useState<Map<string, SlotData>>(() => {
    const m = new Map<string, SlotData>();
    for (const s of initialSlots) m.set(`${s.row}:${s.col}`, s);
    return m;
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(palette[0]?.slug ?? null);
  // Cells with an in-flight save; rendered as a subtle ring rather than the
  // jarring pulse-and-fade we had before (which is what felt laggy).
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedPlant = palette.find((p) => p.slug === selectedSlug) ?? null;

  const filteredPlants = useMemo(() => {
    const q = search.toLowerCase();
    return q ? palette.filter((p) => p.name.toLowerCase().includes(q)) : palette;
  }, [palette, search]);

  const legendItems = useMemo(() => {
    const counts = new Map<string, { emoji: string | null; name: string | null; count: number }>();
    for (const slot of slots.values()) {
      if (!slot.plantSlug) continue;
      const existing = counts.get(slot.plantSlug);
      if (existing) existing.count += 1;
      else counts.set(slot.plantSlug, { emoji: slot.plantEmoji, name: slot.plantName, count: 1 });
    }
    return Array.from(counts, ([slug, v]) => ({ slug, ...v }));
  }, [slots]);

  const gridStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }),
    [cols],
  );

  // Auto-fade the "Sparat ✓" badge after 2s so it doesn't linger as noise.
  useEffect(() => {
    if (!savedAt) return;
    const id = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(id);
  }, [savedAt]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const key = `${row}:${col}`;
      const previous = slots.get(key);  // snapshot for rollback
      const isSamePlant = previous?.plantSlug === selectedSlug;
      const newSlug = isSamePlant ? null : selectedSlug;

      // 1. Optimistic update — instant feedback, no waiting on the network.
      const plant = newSlug ? palette.find((p) => p.slug === newSlug) : null;
      setSlots((prev) => {
        const next = new Map(prev);
        if (newSlug === null) next.delete(key);
        else next.set(key, {
          row, col, plantSlug: newSlug,
          plantEmoji: plant?.emoji ?? null,
          plantName: plant?.name ?? null,
        });
        return next;
      });

      setPendingSaves((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setSaveError(null);

      // 2. Persist in background.
      void (async () => {
        try {
          const res = await fetch(`/api/beds/${bedId}/slots`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ row, col, plantSlug: newSlug }),
          });
          if (!res.ok) throw new Error('Save failed');

          if (newSlug === null) {
            track({ name: 'plant_removed', properties: { bed_id: bedId, row, col } });
          } else {
            track({ name: 'plant_added', properties: { plant_slug: newSlug, bed_id: bedId, row, col } });
          }
          setSavedAt(Date.now());
        } catch {
          // Roll back the optimistic update.
          setSlots((prev) => {
            const next = new Map(prev);
            if (previous) next.set(key, previous);
            else next.delete(key);
            return next;
          });
          setSaveError('Kunde inte spara — kontrollera att du är online och försök igen.');
        } finally {
          setPendingSaves((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      })();
    },
    [bedId, selectedSlug, slots, palette],
  );

  const filledCount = slots.size;
  const total = rows * cols;
  const isSaving = pendingSaves.size > 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Plant palette */}
      <aside className="w-full flex-shrink-0 lg:w-64">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Växtpalett</h2>
            <button
              onClick={() => setSelectedSlug(null)}
              disabled={palette.length === 0}
              className={`mt-2 w-full rounded-md border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedSlug === null && palette.length > 0
                  ? 'border-red-400 bg-red-50 font-medium text-red-700'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              🗑 Raderingsläge
            </button>
          </div>
          <div className="p-3">
            {palette.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-gray-500">
                Inga växter i katalogen än.
              </p>
            ) : (
              <>
                <input
                  type="search"
                  placeholder="Sök växter…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-green-400 focus:outline-none"
                />
                <ul className="max-h-[60vh] overflow-y-auto space-y-0.5">
                  {filteredPlants.map((plant) => (
                    <li key={plant.slug}>
                      <button
                        onClick={() => setSelectedSlug(plant.slug)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                          selectedSlug === plant.slug
                            ? 'bg-green-100 font-medium text-green-800 ring-1 ring-green-300'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{plant.emoji}</span>
                        <span className="flex-1">{plant.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Grid + stats */}
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>
            {filledCount} / {total} rutor planterade
          </span>
          <div className="flex items-center gap-3">
            {/* Save status — always visible so user understands changes auto-save */}
            <span aria-live="polite" className="text-xs">
              {isSaving ? (
                <span className="text-gray-400">Sparar…</span>
              ) : savedAt ? (
                <span className="text-green-700">Sparat ✓</span>
              ) : (
                <span className="text-gray-300">Sparas automatiskt</span>
              )}
            </span>
            <span>
              {palette.length === 0 ? (
                <span className="text-amber-600">Välj först en växt i katalogen</span>
              ) : selectedPlant ? (
                <>
                  Planterar{' '}
                  <strong className="text-gray-700">
                    {selectedPlant.emoji} {selectedPlant.name}
                  </strong>
                </>
              ) : (
                <strong className="text-red-600">Raderingsläge</strong>
              )}
            </span>
          </div>
        </div>

        {saveError && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <div
          className="inline-grid gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          style={gridStyle}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const key = `${r}:${c}`;
              const slot = slots.get(key);
              const cellSaving = pendingSaves.has(key);
              const isCurrentPlant = slot?.plantSlug === selectedSlug;

              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  title={slot ? `${slot.plantName} — klicka för att ta bort` : selectedPlant ? `Plantera ${selectedPlant.name}` : 'Tom ruta'}
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg border text-2xl transition select-none
                    sm:h-14 sm:w-14
                    ${cellSaving ? 'ring-1 ring-green-200' : ''}
                    ${slot
                      ? isCurrentPlant
                        ? 'border-green-400 bg-green-50 ring-2 ring-green-300 hover:bg-red-50 hover:ring-red-200'
                        : 'border-green-300 bg-green-50 hover:border-red-300 hover:bg-red-50'
                      : 'border-dashed border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50'
                    }
                  `}
                >
                  {slot ? slot.plantEmoji : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Legend */}
        {slots.size > 0 && (
          <div className="mt-4 rounded-lg border border-gray-100 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Det här är planterat
            </h3>
            <div className="flex flex-wrap gap-2">
              {legendItems.map((item) => (
                <span
                  key={item.slug}
                  className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800"
                >
                  {item.emoji} {item.name}{' '}
                  <span className="rounded-full bg-green-200 px-1.5 font-medium">{item.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

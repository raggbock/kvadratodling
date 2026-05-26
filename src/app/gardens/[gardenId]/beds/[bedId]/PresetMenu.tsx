'use client';

import { useState, useMemo } from 'react';
import { PRESETS, applyPreset, type Preset, type PresetSlot } from '@/lib/presets';

interface PalettePlant {
  slug: string;
  name: string;
  emoji: string;
  plantsPerSqft: number;
}

interface Props {
  rows: number;
  cols: number;
  palette: PalettePlant[];
  existingCount: number;
  onApply: (preset: Preset, slots: PresetSlot[]) => Promise<void>;
}

export function PresetMenu({ rows, cols, palette, existingCount, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Preset | null>(null);
  const totalSquares = rows * cols;

  const paletteBySlug = useMemo(
    () => new Map(palette.map((p) => [p.slug, p])),
    [palette],
  );

  // Filter to presets that reference plants we actually have in the palette
  // and where the bed has enough squares.
  const available = useMemo(() => {
    return PRESETS.filter((p) => {
      if (totalSquares < p.minSquares) return false;
      return p.plants.every((plant) => paletteBySlug.has(plant.slug));
    });
  }, [paletteBySlug, totalSquares]);

  async function handleConfirm(preset: Preset) {
    setPending(preset.id);
    try {
      const slots = applyPreset(rows, cols, preset);
      await onApply(preset, slots);
      setOpen(false);
      setConfirming(null);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 transition hover:border-green-400 hover:bg-green-100"
      >
        ✨ Använd preset
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setConfirming(null);
            }
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {confirming ? (
              <ConfirmStep
                preset={confirming}
                rows={rows}
                cols={cols}
                palette={paletteBySlug}
                existingCount={existingCount}
                pending={pending === confirming.id}
                onCancel={() => setConfirming(null)}
                onConfirm={() => handleConfirm(confirming)}
              />
            ) : (
              <PresetList
                presets={available}
                rows={rows}
                cols={cols}
                palette={paletteBySlug}
                onClose={() => setOpen(false)}
                onPick={(p) => setConfirming(p)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PresetList({
  presets,
  rows,
  cols,
  palette,
  onClose,
  onPick,
}: {
  presets: Preset[];
  rows: number;
  cols: number;
  palette: Map<string, PalettePlant>;
  onClose: () => void;
  onPick: (preset: Preset) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Välj en preset</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Optimerade planteringar för din bädd ({rows} × {cols} rutor).
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Stäng"
        >
          ✕
        </button>
      </div>

      {presets.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          Inga presets passar bädden — den är för liten eller saknar växter i katalogen.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {presets.map((preset) => {
            const slots = applyPreset(rows, cols, preset);
            const breakdown = new Map<string, number>();
            for (const s of slots) breakdown.set(s.slug, (breakdown.get(s.slug) ?? 0) + 1);
            return (
              <li key={preset.id}>
                <button
                  onClick={() => onPick(preset)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-green-50"
                >
                  <span className="mt-0.5 text-3xl" aria-hidden>
                    {preset.emoji}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{preset.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Array.from(breakdown.entries()).map(([slug, count]) => {
                        const plant = palette.get(slug);
                        if (!plant) return null;
                        const totalPlants = plant.plantsPerSqft >= 1
                          ? count * plant.plantsPerSqft
                          : count;
                        return (
                          <span
                            key={slug}
                            className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                          >
                            {plant.emoji} {plant.name}
                            <span className="text-gray-500">
                              · {count}r{plant.plantsPerSqft >= 2 ? ` (${totalPlants})` : ''}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ConfirmStep({
  preset,
  rows,
  cols,
  palette,
  existingCount,
  pending,
  onCancel,
  onConfirm,
}: {
  preset: Preset;
  rows: number;
  cols: number;
  palette: Map<string, PalettePlant>;
  existingCount: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const slots = useMemo(() => applyPreset(rows, cols, preset), [rows, cols, preset]);
  const slotBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of slots) m.set(`${s.row}:${s.col}`, s.slug);
    return m;
  }, [slots]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {preset.emoji} {preset.name} — förhandsvisning
        </h2>
        <button
          onClick={onCancel}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Tillbaka"
        >
          ←
        </button>
      </div>

      <div className="px-5 py-5">
        <div
          className="mx-auto inline-grid gap-1 rounded-lg border border-gray-200 bg-gray-50 p-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const slug = slotBySlug.get(`${r}:${c}`);
              const plant = slug ? palette.get(slug) : null;
              return (
                <div
                  key={`${r}:${c}`}
                  className="flex h-10 w-10 items-center justify-center rounded border border-green-200 bg-green-50 text-lg sm:h-11 sm:w-11"
                  title={plant?.name ?? ''}
                >
                  {plant?.emoji ?? ''}
                </div>
              );
            })
          )}
        </div>

        {existingCount > 0 && (
          <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            ⚠️ Bädden innehåller redan {existingCount} planterade rutor som kommer att skrivas över.
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {pending ? 'Applicerar…' : `Applicera ${preset.name}`}
          </button>
        </div>
      </div>
    </>
  );
}

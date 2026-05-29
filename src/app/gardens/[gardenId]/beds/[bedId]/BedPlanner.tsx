'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { track } from '@/lib/analytics';
import { PresetMenu } from './PresetMenu';
import type { Preset, PresetSlot } from '@/lib/presets';
import { findConflictCells } from '@/lib/companionConflicts';

interface PalettePlant {
  slug: string;
  name: string;
  emoji: string;
  plantsPerSqft: number;
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
  companions: Record<string, { companions: string[]; antagonists: string[] }>;
}

export default function BedPlanner({
  bedId,
  rows,
  cols,
  initialSlots,
  palette,
  companions,
}: BedPlannerProps) {
  const [slots, setSlots] = useState<Map<string, SlotData>>(() => {
    const m = new Map<string, SlotData>();
    for (const s of initialSlots) m.set(`${s.row}:${s.col}`, s);
    return m;
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(palette[0]?.slug ?? null);
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const paletteBySlug = useMemo(() => new Map(palette.map((p) => [p.slug, p])), [palette]);
  const selectedPlant = selectedSlug ? paletteBySlug.get(selectedSlug) ?? null : null;

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

  // Cells whose plant has an antagonist in an orthogonally adjacent cell.
  const conflictCells = useMemo(() => {
    const planted = new Map<string, string>();
    for (const slot of slots.values()) {
      if (slot.plantSlug) planted.set(`${slot.row}:${slot.col}`, slot.plantSlug);
    }
    return findConflictCells(planted, companions);
  }, [slots, companions]);

  // Arrow-key navigation between cells, layered on top of native button focus
  // so a handler bug can never remove basic Tab access.
  const moveFocus = useCallback(
    (r: number, c: number, key: string) => {
      let nr = r;
      let nc = c;
      if (key === 'ArrowUp') nr = Math.max(0, r - 1);
      else if (key === 'ArrowDown') nr = Math.min(rows - 1, r + 1);
      else if (key === 'ArrowLeft') nc = Math.max(0, c - 1);
      else if (key === 'ArrowRight') nc = Math.min(cols - 1, c + 1);
      else return false;
      document.querySelector<HTMLButtonElement>(`[data-cell="${nr}:${nc}"]`)?.focus();
      return true;
    },
    [rows, cols],
  );

  // Companion / antagonist chips for the selected plant. Filter out plants
  // not in the palette (catalog drift) and resolve emoji/name.
  const selectedNeighbours = useMemo(() => {
    if (!selectedSlug) return { good: [], bad: [] };
    const c = companions[selectedSlug] ?? { companions: [], antagonists: [] };
    const resolve = (slug: string) => paletteBySlug.get(slug);
    return {
      good: c.companions.map(resolve).filter((p): p is PalettePlant => !!p),
      bad: c.antagonists.map(resolve).filter((p): p is PalettePlant => !!p),
    };
  }, [selectedSlug, companions, paletteBySlug]);

  useEffect(() => {
    if (!savedAt) return;
    const id = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(id);
  }, [savedAt]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const key = `${row}:${col}`;
      const previous = slots.get(key);
      const isSamePlant = previous?.plantSlug === selectedSlug;
      const newSlug = isSamePlant ? null : selectedSlug;
      const plant = newSlug ? paletteBySlug.get(newSlug) : null;

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
    [bedId, selectedSlug, slots, paletteBySlug],
  );

  const filledCount = slots.size;
  const total = rows * cols;
  const isSaving = pendingSaves.size > 0;

  const handleApplyPreset = useCallback(
    async (preset: Preset, newSlots: PresetSlot[]) => {
      // Snapshot for rollback
      const previous = new Map(slots);

      // Optimistic: replace local state immediately
      const next = new Map<string, SlotData>();
      for (const s of newSlots) {
        const plant = paletteBySlug.get(s.slug);
        next.set(`${s.row}:${s.col}`, {
          row: s.row,
          col: s.col,
          plantSlug: s.slug,
          plantEmoji: plant?.emoji ?? null,
          plantName: plant?.name ?? null,
        });
      }
      setSlots(next);
      setSaveError(null);

      try {
        const res = await fetch(`/api/beds/${bedId}/preset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slots: newSlots }),
        });
        if (!res.ok) throw new Error('Preset apply failed');
        track({ name: 'preset_applied', properties: { preset_id: preset.id, bed_id: bedId, slot_count: newSlots.length } });
        setSavedAt(Date.now());
      } catch {
        setSlots(previous);
        setSaveError(`Kunde inte applicera "${preset.name}". Försök igen.`);
        throw new Error('apply failed'); // bubble up so PresetMenu doesn't close
      }
    },
    [bedId, slots, paletteBySlug],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Plant palette + companion hints */}
      <aside className="w-full flex-shrink-0 space-y-4 lg:w-64">
        <div className="rounded-xl border border-border-default bg-surface-default shadow-sm">
          <div className="border-b border-border-subtle px-4 py-3">
            <h2 className="text-sm font-semibold text-text-subtle">Växtpalett</h2>
            <button
              onClick={() => setSelectedSlug(null)}
              disabled={palette.length === 0}
              className={`mt-2 w-full rounded-md border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                selectedSlug === null && palette.length > 0
                  ? 'border-status-negative bg-status-negative-subtle font-medium text-status-negative'
                  : 'border-border-default text-text-subtle hover:bg-surface-subtle'
              }`}
            >
              🗑 Raderingsläge
            </button>
          </div>
          <div className="p-3">
            {palette.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-text-subtle">
                Inga växter i katalogen än.
              </p>
            ) : (
              <>
                <input
                  type="search"
                  placeholder="Sök växter…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2 w-full rounded-md border border-border-subtle px-2 py-1.5 text-sm focus:border-brand-default focus:outline-none"
                />
                <ul className="max-h-[50vh] overflow-y-auto space-y-0.5">
                  {filteredPlants.map((plant) => (
                    <li key={plant.slug}>
                      <button
                        onClick={() => setSelectedSlug(plant.slug)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                          selectedSlug === plant.slug
                            ? 'bg-status-positive-subtle font-medium text-status-positive ring-1 ring-status-positive'
                            : 'text-text-default hover:bg-surface-subtle'
                        }`}
                      >
                        <span className="text-base">{plant.emoji}</span>
                        <span className="flex-1">{plant.name}</span>
                        {plant.plantsPerSqft >= 2 && (
                          <span
                            className="rounded-sm bg-surface-subtle px-1 text-[10px] font-medium text-text-muted"
                            title={`${plant.plantsPerSqft} plantor per ruta`}
                          >
                            ×{plant.plantsPerSqft}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Selected plant detail — per-ruta count + companions/antagonists */}
        {selectedPlant && (
          <div className="rounded-xl border border-border-default bg-surface-default p-4 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Vald växt
            </p>
            <p className="text-sm font-semibold text-text-default">
              {selectedPlant.emoji} {selectedPlant.name}
            </p>
            <p className="mt-0.5 text-xs text-text-subtle">
              {selectedPlant.plantsPerSqft >= 2
                ? `${selectedPlant.plantsPerSqft} plantor per ruta — en klick = ${selectedPlant.plantsPerSqft} ${selectedPlant.name.toLowerCase()}`
                : selectedPlant.plantsPerSqft === 1
                  ? '1 planta per ruta'
                  : `Behöver ${Math.round(1 / selectedPlant.plantsPerSqft)} rutor`}
            </p>

            {selectedNeighbours.good.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-status-positive">🤝 Bra grannar</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNeighbours.good.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => setSelectedSlug(p.slug)}
                      className="flex items-center gap-1 rounded-full border border-status-positive bg-status-positive-subtle px-2 py-0.5 text-xs text-status-positive transition hover:bg-status-positive-subtle"
                      title={`Klicka för att välja ${p.name}`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedNeighbours.bad.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-status-negative">⚠️ Dåliga grannar</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNeighbours.bad.map((p) => (
                    <span
                      key={p.slug}
                      className="flex items-center gap-1 rounded-full border border-status-negative bg-status-negative-subtle px-2 py-0.5 text-xs text-status-negative"
                      title={`Undvik att plantera bredvid ${p.name}`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedNeighbours.good.length === 0 && selectedNeighbours.bad.length === 0 && (
              <p className="mt-3 text-xs italic text-text-muted">
                Ingen sällskapsdata för den här växten ännu.
              </p>
            )}
          </div>
        )}
      </aside>

      {/* Grid + stats */}
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-text-subtle">
            <span>
              {filledCount} / {total} rutor planterade
            </span>
            <PresetMenu
              rows={rows}
              cols={cols}
              palette={palette}
              existingCount={filledCount}
              onApply={handleApplyPreset}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-text-subtle">
            <span aria-live="polite" className="text-xs">
              {isSaving ? (
                <span className="text-text-muted">Sparar…</span>
              ) : savedAt ? (
                <span className="text-status-positive">Sparat ✓</span>
              ) : (
                <span className="text-text-muted">Sparas automatiskt</span>
              )}
            </span>
            <span>
              {palette.length === 0 ? (
                <span className="text-status-warning">Välj först en växt i katalogen</span>
              ) : selectedPlant ? (
                <>
                  Planterar{' '}
                  <strong className="text-text-default">
                    {selectedPlant.emoji} {selectedPlant.name}
                  </strong>
                </>
              ) : (
                <strong className="text-status-negative">Raderingsläge</strong>
              )}
            </span>
          </div>
        </div>

        {saveError && (
          <div className="mb-3 rounded-md bg-status-negative-subtle px-3 py-2 text-sm text-status-negative">
            {saveError}
          </div>
        )}

        {conflictCells.size > 0 && (
          <div className="mb-3 rounded-md bg-status-warning-subtle px-3 py-2 text-sm text-status-warning">
            ⚠️ {conflictCells.size} {conflictCells.size === 1 ? 'ruta har en granne' : 'rutor har grannar'} som inte trivs ihop.
          </div>
        )}

        <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div
          role="group"
          aria-label={`Odlingsbädd, ${cols} kolumner gånger ${rows} rader`}
          className="inline-grid gap-1 rounded-xl border border-border-default bg-surface-default p-3 shadow-sm"
          style={gridStyle}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const key = `${r}:${c}`;
              const slot = slots.get(key);
              const cellSaving = pendingSaves.has(key);
              const isCurrentPlant = slot?.plantSlug === selectedSlug;
              const cellPlant = slot?.plantSlug ? paletteBySlug.get(slot.plantSlug) : null;
              const perSquare = cellPlant?.plantsPerSqft ?? 0;
              const cellConflict = conflictCells.has(key);
              const cellLabel = `Rad ${r + 1}, kolumn ${c + 1}${slot?.plantName ? `, ${slot.plantName}` : ', tom'}${cellConflict ? ', olämplig granne' : ''}`;

              return (
                <button
                  key={key}
                  data-cell={key}
                  aria-label={cellLabel}
                  onClick={() => handleCellClick(r, c)}
                  onKeyDown={(e) => {
                    if (moveFocus(r, c, e.key)) e.preventDefault();
                  }}
                  title={
                    slot
                      ? `${slot.plantName}${perSquare >= 2 ? ` (×${perSquare})` : ''} — klicka för att ta bort`
                      : selectedPlant
                        ? `Plantera ${selectedPlant.name}${selectedPlant.plantsPerSqft >= 2 ? ` (×${selectedPlant.plantsPerSqft})` : ''}`
                        : 'Tom ruta'
                  }
                  className={`
                    relative flex h-12 w-12 items-center justify-center rounded-lg border text-2xl transition select-none
                    sm:h-14 sm:w-14
                    ${cellSaving ? 'ring-1 ring-brand-subtle' : ''}
                    ${slot
                      ? isCurrentPlant
                        ? 'border-status-positive bg-status-positive-subtle ring-2 ring-status-positive hover:bg-status-negative-subtle hover:ring-status-negative'
                        : 'border-status-positive bg-status-positive-subtle hover:border-status-negative hover:bg-status-negative-subtle'
                      : 'border-dashed border-border-subtle bg-surface-subtle hover:border-brand-default hover:bg-brand-muted'
                    }
                    ${cellConflict ? 'outline outline-2 outline-offset-1 outline-status-negative' : ''}
                  `}
                >
                  {slot ? slot.plantEmoji : ''}
                  {cellConflict && (
                    <span className="pointer-events-none absolute -left-1 -top-1 text-xs" aria-hidden>
                      ⚠️
                    </span>
                  )}
                  {perSquare >= 2 && (
                    <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 rounded-bl-md rounded-tr-md bg-surface-default/95 px-1 text-[9px] font-semibold leading-tight text-text-subtle shadow-sm">
                      ×{perSquare}
                    </span>
                  )}
                </button>
              );
            })
          )}
          </div>
        </div>

        {/* Legend */}
        {slots.size > 0 && (
          <div className="mt-4 rounded-lg border border-border-subtle bg-surface-default p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Det här är planterat
            </h3>
            <div className="flex flex-wrap gap-2">
              {legendItems.map((item) => {
                const plant = paletteBySlug.get(item.slug);
                const per = plant?.plantsPerSqft ?? 1;
                const totalPlants = per >= 1 ? item.count * per : item.count;
                return (
                  <span
                    key={item.slug}
                    className="flex items-center gap-1 rounded-full bg-status-positive-subtle px-2.5 py-1 text-xs text-status-positive"
                    title={
                      per >= 2
                        ? `${item.count} rutor × ${per} = ${totalPlants} ${item.name?.toLowerCase()}`
                        : undefined
                    }
                  >
                    {item.emoji} {item.name}{' '}
                    <span className="rounded-full bg-status-positive px-1.5 font-medium text-white">
                      {per >= 2 ? `${item.count}r · ${totalPlants}` : item.count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

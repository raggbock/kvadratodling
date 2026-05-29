'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { computeOptimalBeds, summarizeBedSizes } from '@/lib/bedLayout';
import { track } from '@/lib/analytics';

interface Bed {
  id: string;
  name: string;
  rows: number;
  cols: number;
  widthCm: number | null;
  lengthCm: number | null;
  plantingSlots: { id: string }[];
}

interface Garden {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  widthCm: number | null;
  lengthCm: number | null;
  beds: Bed[];
}

export function GardenDetailClient({ garden }: { garden: Garden }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const layout =
    garden.widthCm && garden.lengthCm
      ? computeOptimalBeds(garden.widthCm, garden.lengthCm)
      : null;

  async function handleAutoGenerate() {
    if (!layout || layout.beds.length === 0) return;
    setGenerating(true);
    try {
      await Promise.all(
        layout.beds.map((bed) =>
          fetch(`/api/gardens/${garden.id}/beds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: bed.name,
              rows: bed.rows,
              cols: bed.cols,
              widthCm: bed.widthCm,
              lengthCm: bed.lengthCm,
            }),
          })
        )
      );
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Ta bort trädgården "${garden.name}"? Det går inte att ångra.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gardens/${garden.id}`, { method: 'DELETE' });
      if (res.ok) track({ name: 'garden_deleted' });
      router.push('/gardens');
    } catch {
      setDeleting(false);
    }
  }

  const gardenId = garden.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-text-subtle">
        <Link href="/gardens" className="hover:text-brand-emphasis">
          Mina odlingar
        </Link>{' '}
        /
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-default">{garden.name}</h1>
          {garden.description && (
            <p className="mt-1 text-sm text-text-subtle">{garden.description}</p>
          )}
          {garden.location && (
            <p className="mt-1 text-xs text-text-muted">📍 {garden.location}</p>
          )}
          {garden.widthCm && garden.lengthCm && (
            <p className="mt-1 text-xs text-text-muted">
              📐 {(garden.widthCm / 100).toFixed(1)} m × {(garden.lengthCm / 100).toFixed(1)} m
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/gardens/${gardenId}/schedule`}
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 text-sm font-medium text-text-default hover:bg-surface-subtle"
          >
            📅 Odlingsschema
          </Link>
          <Link
            href={`/gardens/${gardenId}/edit`}
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 text-sm font-medium text-text-default hover:bg-surface-subtle"
          >
            Redigera
          </Link>
          <Link
            href={`/gardens/${gardenId}/beds/new`}
            className="rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis"
          >
            + Lägg till låda
          </Link>
        </div>
      </div>

      {/* Auto-generate panel */}
      {layout && layout.beds.length > 0 && garden.beds.length === 0 && (
        <div className="mb-6 rounded-xl border border-brand-subtle bg-brand-muted p-4">
          <h2 className="mb-1 font-semibold text-text-default">Optimerat odlingslayout</h2>
          <p className="mb-3 text-sm text-text-subtle">
            Baserat på din yta ({(garden.widthCm! / 100).toFixed(1)} × {(garden.lengthCm! / 100).toFixed(1)} m)
            passar {layout.beds.length} odlingslåda{layout.beds.length !== 1 ? 'r' : ''}
            {' '}({summarizeBedSizes(layout.beds).map((g) => `${g.count} à ${g.size} cm`).join(' + ')})
            — totalt {layout.beds.reduce((s, b) => s + b.rows * b.cols, 0)} odlingsrutor à 30×30 cm.
          </p>
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis disabled:opacity-50"
          >
            {generating ? 'Skapar…' : `Skapa ${layout.beds.length} odlingslåda${layout.beds.length !== 1 ? 'r' : ''} automatiskt`}
          </button>
        </div>
      )}

      {/* Beds list */}
      {garden.beds.length === 0 ? (
        <>
          <div className="mb-4 rounded-xl border border-brand-subtle bg-brand-muted p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-text-default">📅 Börja med försådd redan idag</h2>
                <p className="mt-1 text-sm text-text-subtle">
                  Du behöver inte ha lagt upp lådorna ännu — schemat visar vad du kan så
                  inomhus och planera för de närmaste 12 månaderna baserat på din sista frost.
                </p>
              </div>
              <Link
                href={`/gardens/${gardenId}/schedule`}
                className="shrink-0 rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis"
              >
                Se mitt såschema →
              </Link>
            </div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-border-default bg-surface-default py-16 text-center">
            <div className="mb-3 text-4xl">🛏</div>
            <h2 className="mb-1 font-semibold text-text-default">Inga odlingslådor än</h2>
            <p className="mb-4 text-sm text-text-subtle">
              {layout && layout.beds.length > 0
                ? 'Använd auto-genereringsknappen ovan, eller lägg till en låda manuellt.'
                : 'Lägg till en låda för att börja planera.'}
            </p>
            <Link
              href={`/gardens/${gardenId}/beds/new`}
              className="rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis"
            >
              Lägg till en låda manuellt
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {garden.beds.map((bed) => {
              const filled = bed.plantingSlots.length;
              const total = bed.rows * bed.cols;
              const pct = Math.round((filled / total) * 100);
              return (
                <Link
                  key={bed.id}
                  href={`/gardens/${gardenId}/beds/${bed.id}`}
                  className="rounded-xl border border-border-default bg-surface-default p-5 shadow-sm transition hover:border-brand-subtle hover:shadow-md"
                >
                  <h2 className="font-semibold text-text-default">{bed.name}</h2>
                  <p className="mt-1 text-sm text-text-subtle">
                    {bed.widthCm ?? bed.cols * 30}×{bed.lengthCm ?? bed.rows * 30} cm ({bed.cols} × {bed.rows} rutor)
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-text-muted">
                      <span>{filled} planterade</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-subtle">
                      <div
                        className="h-1.5 rounded-full bg-status-positive"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Re-show auto-generate if beds exist but user may want more */}
          {layout && layout.beds.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleAutoGenerate}
                disabled={generating}
                className="text-sm text-text-subtle underline hover:text-brand-emphasis disabled:opacity-50"
              >
                {generating ? 'Skapar…' : `+ Lägg till ${layout.beds.length} auto-genererade lådor`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete */}
      <div className="mt-12 border-t border-border-subtle pt-6">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-status-negative hover:text-brand-emphasis disabled:opacity-50"
        >
          {deleting ? 'Tar bort…' : 'Ta bort den här odlingen'}
        </button>
      </div>
    </div>
  );
}

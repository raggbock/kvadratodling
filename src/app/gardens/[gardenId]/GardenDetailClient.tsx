'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { computeOptimalBeds, summarizeBedSizes } from '@/lib/bedLayout';

interface Bed {
  id: string;
  name: string;
  rows: number;
  cols: number;
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
            body: JSON.stringify({ name: bed.name, rows: bed.rows, cols: bed.cols }),
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
      await fetch(`/api/gardens/${garden.id}`, { method: 'DELETE' });
      router.push('/gardens');
    } catch {
      setDeleting(false);
    }
  }

  const gardenId = garden.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-700">
          My gardens
        </Link>{' '}
        /
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{garden.name}</h1>
          {garden.description && (
            <p className="mt-1 text-sm text-gray-500">{garden.description}</p>
          )}
          {garden.location && (
            <p className="mt-1 text-xs text-gray-400">📍 {garden.location}</p>
          )}
          {garden.widthCm && garden.lengthCm && (
            <p className="mt-1 text-xs text-gray-400">
              📐 {(garden.widthCm / 100).toFixed(1)} m × {(garden.lengthCm / 100).toFixed(1)} m
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/gardens/${gardenId}/edit`}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            href={`/gardens/${gardenId}/beds/new`}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            + Add bed
          </Link>
        </div>
      </div>

      {/* Auto-generate panel */}
      {layout && layout.beds.length > 0 && garden.beds.length === 0 && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="mb-1 font-semibold text-green-900">Optimerat odlingslayout</h2>
          <p className="mb-3 text-sm text-green-700">
            Baserat på din yta ({(garden.widthCm! / 100).toFixed(1)} × {(garden.lengthCm! / 100).toFixed(1)} m)
            passar {layout.beds.length} odlingslåda{layout.beds.length !== 1 ? 'r' : ''}
            {' '}({summarizeBedSizes(layout.beds).map((g) => `${g.count} à ${g.size} cm`).join(' + ')})
            — totalt {layout.beds.reduce((s, b) => s + b.rows * b.cols, 0)} odlingsrutor à 30×30 cm.
          </p>
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? 'Skapar…' : `Skapa ${layout.beds.length} odlingslåda${layout.beds.length !== 1 ? 'r' : ''} automatiskt`}
          </button>
        </div>
      )}

      {/* Beds list */}
      {garden.beds.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mb-3 text-4xl">🛏</div>
          <h2 className="mb-1 font-semibold text-gray-700">No beds yet</h2>
          <p className="mb-4 text-sm text-gray-500">
            {layout && layout.beds.length > 0
              ? 'Use the auto-generate button above, or add a bed manually.'
              : 'Add a bed to start planning your layout.'}
          </p>
          <Link
            href={`/gardens/${gardenId}/beds/new`}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Add a bed manually
          </Link>
        </div>
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
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
                >
                  <h2 className="font-semibold text-gray-900">{bed.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {bed.cols} × {bed.rows} rutor ({bed.cols * bed.rows} sq ft)
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-gray-400">
                      <span>{filled} planted</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-green-400"
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
                className="text-sm text-gray-500 underline hover:text-green-700 disabled:opacity-50"
              >
                {generating ? 'Skapar…' : `+ Lägg till ${layout.beds.length} auto-genererade lådor`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete */}
      <div className="mt-12 border-t border-gray-100 pt-6">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete this garden'}
        </button>
      </div>
    </div>
  );
}

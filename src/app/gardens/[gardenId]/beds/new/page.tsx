'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const SQUARE_CM = 30;

// Vanliga pallkrage-mått i Sverige (cm). Värdena 120×120, 120×240, 90×180 och
// 60×180 ligger på 30 cm-rutnätet och utnyttjas helt; standardstorlekar som
// 100×120 finns medvetet inte här eftersom de spiller cm i rutnätet.
const PRESETS = [
  { label: 'Pallkrage 120×120 cm', widthCm: 120, lengthCm: 120 },
  { label: 'Pallkrage 120×240 cm', widthCm: 120, lengthCm: 240 },
  { label: 'Pallkrage 90×180 cm',  widthCm: 90,  lengthCm: 180 },
  { label: 'Pallkrage 60×180 cm',  widthCm: 60,  lengthCm: 180 },
];

function cmToSquares(cm: number): number {
  return Math.max(1, Math.floor(cm / SQUARE_CM));
}

export default function NewBedPage() {
  const router = useRouter();
  const { gardenId } = useParams<{ gardenId: string }>();
  const [name, setName] = useState('Pallkrage 1');
  const [widthCm, setWidthCm] = useState(120);
  const [lengthCm, setLengthCm] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cols = cmToSquares(widthCm);
  const rows = cmToSquares(lengthCm);
  const usedWidthCm = cols * SQUARE_CM;
  const usedLengthCm = rows * SQUARE_CM;
  const widthOverflow = widthCm - usedWidthCm;
  const lengthOverflow = lengthCm - usedLengthCm;

  function applyPreset(p: typeof PRESETS[number]) {
    setWidthCm(p.widthCm);
    setLengthCm(p.lengthCm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/gardens/${gardenId}/beds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rows, cols }),
      });
      if (!res.ok) throw new Error('Failed');
      const bed = await res.json();
      router.push(`/gardens/${gardenId}/beds/${bed.id}`);
    } catch {
      setError('Något gick fel. Försök igen.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="mb-2 text-sm text-gray-500">
        <Link href={`/gardens/${gardenId}`} className="hover:text-green-700">
          Odling
        </Link>{' '}
        /
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Lägg till odlingslåda</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Namn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="t.ex. Södra pallkragen"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Vanliga pallkrage-storlekar</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const isActive = widthCm === p.widthCm && lengthCm === p.lengthCm;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Egna mått</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={SQUARE_CM}
                max={SQUARE_CM * 20}
                step={1}
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                placeholder="Bredd"
                aria-label="Bredd i centimeter"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                cm
              </span>
            </div>
            <span className="shrink-0 text-gray-400">×</span>
            <div className="relative flex-1">
              <input
                type="number"
                min={SQUARE_CM}
                max={SQUARE_CM * 20}
                step={1}
                value={lengthCm}
                onChange={(e) => setLengthCm(Number(e.target.value))}
                placeholder="Längd"
                aria-label="Längd i centimeter"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                cm
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
          <p className="font-medium text-green-800">
            {cols} × {rows} rutor ({cols * rows} totalt)
          </p>
          <p className="mt-0.5 text-xs text-green-700">
            Planeras som {usedWidthCm} × {usedLengthCm} cm. Varje ruta är 30×30 cm.
          </p>
          {(widthOverflow > 0 || lengthOverflow > 0) && (
            <p className="mt-1 text-xs text-amber-700">
              Dina mått ligger inte exakt på rutnätet —{' '}
              {widthOverflow > 0 && `${widthOverflow} cm överblir i bredd`}
              {widthOverflow > 0 && lengthOverflow > 0 && ', '}
              {lengthOverflow > 0 && `${lengthOverflow} cm överblir i längd`}.
              Planeraren använder närmaste hela rutor.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Skapar…' : 'Skapa pallkrage'}
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

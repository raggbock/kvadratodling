'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const PRESETS = [
  { label: '4 × 4 ft', rows: 4, cols: 4 },
  { label: '4 × 8 ft', rows: 4, cols: 8 },
  { label: '3 × 6 ft', rows: 3, cols: 6 },
  { label: '2 × 6 ft', rows: 2, cols: 6 },
];

export default function NewBedPage() {
  const router = useRouter();
  const { gardenId } = useParams<{ gardenId: string }>();
  const [name, setName] = useState('Bed 1');
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="mb-2 text-sm text-gray-500">
        <Link href={`/gardens/${gardenId}`} className="hover:text-green-700">
          Garden
        </Link>{' '}
        /
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add a bed</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Bed name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. South bed"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Size presets</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setRows(p.rows); setCols(p.cols); }}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  rows === p.rows && cols === p.cols
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Columns (width)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rows (depth)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Total: <span className="font-medium text-gray-700">{rows * cols} squares</span> (each square = 1 sq ft / 30×30 cm)
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create bed'}
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

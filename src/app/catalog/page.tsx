import type { Metadata } from 'next';
import { PLANTS } from '@/lib/plants';
import { CatalogClient } from './CatalogClient';

export const metadata: Metadata = {
  title: 'Plant Catalog — Kvadratodling',
  description: 'Browse 25+ plants with spacing, sun and water needs, and companion-planting hints.',
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Plant Catalog</h1>
        <p className="mt-2 text-gray-500">
          {PLANTS.length} plants — click any card for spacing, care tips, and companion hints.
        </p>
      </div>
      <CatalogClient plants={PLANTS} />
    </div>
  );
}

import type { Metadata } from 'next';
import { PLANTS } from '@/lib/plants';
import { CatalogClient } from './CatalogClient';

export const metadata: Metadata = {
  title: 'Växtkatalog | Kvadratodling',
  description: 'Bläddra bland 25+ växter med plantering per ruta, sol- och vattenbehov och sällskapsplanterings-tips.',
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Växtkatalog</h1>
        <p className="mt-2 text-gray-500">
          {PLANTS.length} växter — klicka på ett kort för plantering, skötseltips och sällskapsplantering.
        </p>
      </div>
      <CatalogClient plants={PLANTS} />
    </div>
  );
}

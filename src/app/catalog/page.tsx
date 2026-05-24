import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { CatalogClient } from './CatalogClient';

// Public catalog. Revalidate hourly — plant updates are rare.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Växtkatalog | Kvadratodling',
  description:
    'Bläddra bland 100+ växter med plantering per ruta, sol- och vattenbehov, växtzoner och sällskapsplanterings-tips.',
};

export default async function CatalogPage() {
  const supabase = await createClient();
  const { data: plants } = await supabase
    .from('plants')
    .select(
      'slug, common_name, english_name, emoji, plants_per_sqft, sun_requirement, water_need, days_to_maturity_min, days_to_maturity_max, description, tags',
    )
    .eq('is_active', true)
    .order('common_name');

  const list = plants ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Växtkatalog</h1>
        <p className="mt-2 text-gray-500">
          {list.length} växter — klicka på ett kort för plantering, skötseltips och sällskapsplantering.
        </p>
      </div>
      <CatalogClient plants={list} />
    </div>
  );
}

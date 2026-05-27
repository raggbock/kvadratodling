import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { CatalogClient } from './CatalogClient';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';

// Public catalog. Revalidate hourly — plant updates are rare.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Växtkatalog — 100+ växter för pallkrage',
  description:
    'Komplett växtkatalog för svensk kvadratodling. 100+ växter med plantering per ruta, sol- och vattenbehov, växtzoner Z1–Z8 och vilka som trivs ihop.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'Växtkatalog för pallkrage — Kvadratodling',
    description: '100+ växter med skötseltips och sällskapsplantering.',
    url: `${SITE_URL}/catalog`,
  },
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

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Växtkatalog', item: `${SITE_URL}/catalog` },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/catalog/${p.slug}`,
      name: p.common_name,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={[breadcrumb, itemList]} />
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

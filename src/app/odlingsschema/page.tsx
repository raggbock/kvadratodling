import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SWEDISH_ZONES } from '@/lib/zones';

const PAGE_DESCRIPTION =
  'Odlingsschema för alla svenska zoner — Z1 till Z8. Hitta exakt när du ska så, plantera ut och skörda för din region.';

export const metadata: Metadata = {
  title: 'Odlingsschema Sverige — när ska du så och plantera?',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/odlingsschema' },
  keywords: [
    'odlingsschema', 'odlingsschema sverige', 'när så',
    'när plantera', 'frost sverige', 'sista frost',
  ],
  openGraph: {
    title: 'Odlingsschema för alla svenska odlingszoner',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/odlingsschema`,
    type: 'website',
  },
};

const MONTH_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

function frostDateLabel(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

export default function OdlingsschemaIndexPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Odlingsschema', item: `${SITE_URL}/odlingsschema` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={breadcrumb} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Verktyg</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Odlingsschema Sverige
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Välj din odlingszon för ett komplett sådd- och skördeschema. Sverige har 8 zoner från
          södra Skåne (Z1, mild) till fjällvärlden (Z8, kort säsong) — vilken zon du är i avgör
          exakt när du kan så vad.
        </p>
      </header>

      <div className="space-y-3">
        {SWEDISH_ZONES.map((zone) => (
          <Link
            key={zone.id}
            href={`/odlingsschema/${zone.id.toLowerCase()}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="mr-2 inline-block rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">
                  {zone.id}
                </span>
                {zone.nameSv}
              </h2>
              <div className="text-xs text-gray-500">
                Sista frost: ~{frostDateLabel(zone.lastFrostMD)} · {zone.frostFreeDays} frostfria dagar
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{zone.cities.slice(0, 4).join(', ')}…</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600">
        <strong>Vet du inte din zon?</strong> Klicka din ort på{' '}
        <Link href="/odlingszoner" className="text-green-700 underline">zon-kartan</Link> eller
        använd{' '}
        <Link href="/verktyg/frostkalkylator" className="text-green-700 underline">frostkalkylatorn</Link>.
      </div>
    </div>
  );
}

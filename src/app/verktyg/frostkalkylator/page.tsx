import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SWEDISH_ZONES } from '@/lib/zones';
import { FrostCalculator } from './FrostCalculator';

const PAGE_DESCRIPTION =
  'Snabbt verktyg för att hitta sista frost i svenska odlingszoner. Klicka din region eller välj från listan så får du sista frostdatum, frostfria dagar och växttips.';

export const metadata: Metadata = {
  title: 'Frostkalkylator — sista frost för din ort',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/verktyg/frostkalkylator' },
  keywords: [
    'frostkalkylator', 'sista frost', 'frost sverige',
    'när är sista frost', 'växtzon frost', 'odlingszon karta',
  ],
  openGraph: {
    title: 'Frostkalkylator för svenska odlingszoner',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/verktyg/frostkalkylator`,
    type: 'website',
  },
};

export default function FrostkalkylatorPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Frostkalkylator',
    url: `${SITE_URL}/verktyg/frostkalkylator`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Verktyg', item: `${SITE_URL}/verktyg` },
      { '@type': 'ListItem', position: 3, name: 'Frostkalkylator', item: `${SITE_URL}/verktyg/frostkalkylator` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Verktyg</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Frostkalkylator
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Klicka din region på kartan eller välj från listan så får du <strong>sista frost,
          frostfria dagar och en hint om vad du kan börja så</strong> just nu. Sista frost är
          referenspunkten för hela odlingssäsongen — varma sommarväxter sås 8–12 veckor innan
          dess, frosttoleranta så fort marken är arbetsbar.
        </p>
      </header>

      <FrostCalculator zones={SWEDISH_ZONES} />

      <section className="prose prose-green mt-12 max-w-none">
        <h2 className="text-2xl font-bold text-gray-900">Hur använder jag sista frost?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          De flesta odlingsråd refererar till sista frost som "dag noll". Försådd 8–10 veckor
          före sista frost. Plantera ut 1–2 veckor efter. Direktsådd när jorden går att bearbeta
          (vanligen 4–6 veckor före sista frost för frosttoleranta växter).
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Datumet är en medel — din egen trädgård kan variera med 1–2 veckor åt båda håll
          beroende på söderläge, närhet till sjö/hav, höjd över havet. Kolla{' '}
          <Link href="/odlingszoner" className="text-green-700 underline">zon-guiden</Link> för
          mer info om vad varje zon betyder.
        </p>
      </section>

      <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">Få ett personligt såschema</h2>
        <p className="mt-1 text-sm text-green-800">
          Skapa en gratis odling så får du sådd-, utplanterings- och skördetider för varje växt
          baserat på din zon.
        </p>
        <Link
          href="/gardens/new"
          className="mt-4 inline-block rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Skapa din första odling →
        </Link>
      </div>
    </article>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SWEDISH_ZONES } from '@/lib/zones';

const PAGE_DESCRIPTION =
  'Sverige delas in i 8 odlingszoner från Skåne (Z1) till fjällen (Z8). Här är vad varje zon betyder, sista frostdatum och vilka växter som passar din region.';

export const metadata: Metadata = {
  title: 'Svenska odlingszoner — Z1 till Z8 förklarade',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/odlingszoner' },
  keywords: [
    'odlingszon', 'växtzon sverige', 'svenska odlingszoner', 'sista frost sverige',
    'odlingszon Z1', 'odlingszon Z3', 'odlingszon Z5', 'växtzon karta',
  ],
  openGraph: {
    title: 'Svenska odlingszoner — Z1 till Z8',
    description: 'Hitta din odlingszon, sista frostdatum och vad du kan odla.',
    url: `${SITE_URL}/odlingszoner`,
    type: 'article',
  },
};

const MONTH_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

function frostDateLabel(md: string): string {
  const [m, d] = md.split('-').map(Number);
  return `${d} ${MONTH_SV[m - 1]}`;
}

export default function OdlingszonerPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Svenska odlingszoner — Z1 till Z8 förklarade',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/odlingszoner`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Odlingszoner', item: `${SITE_URL}/odlingszoner` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Svenska odlingszoner
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Sverige delas in i 8 odlingszoner från södra Skåne (Z1) till fjällvärlden (Z8). Din zon
          bestämmer när du kan så, plantera ut och vilka växter som ens har en chans att hinna
          mogna. Här är allt du behöver veta.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vad är en odlingszon?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Sveriges officiella zonsystem utgår från <strong>växternas frostkänslighet och
          säsongslängd</strong> — alltså inte bara temperatur utan också hur många frostfria
          dagar regionen har per år. Z1 (sydligaste Skåne) har 200+ frostfria dagar och en lång
          växtsäsong. Z8 (norra fjällvärlden) har ofta under 100 frostfria dagar.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Systemet är annorlunda från det amerikanska USDA-systemet — om du läser engelska
          odlingsguider, hänvisar de till andra zoner. Använd alltid den svenska zonen för
          svenska odlingsråd.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">De 8 zonerna</h2>
        <div className="mt-4 space-y-3">
          {SWEDISH_ZONES.map((zone) => (
            <div
              key={zone.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="mr-2 inline-block rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">
                    {zone.id}
                  </span>
                  {zone.nameSv}
                </h3>
                <div className="text-xs text-gray-500">
                  Sista frost: ~{frostDateLabel(zone.lastFrostMD)} · {zone.frostFreeDays} frostfria dagar
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{zone.description}</p>
              <p className="mt-2 text-xs text-gray-400">
                <strong>Städer:</strong> {zone.cities.join(', ')}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Vad betyder zonen i praktiken?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Zonen styr främst två saker: <strong>när du sår</strong> och{' '}
          <strong>vad du kan odla</strong>.
        </p>

        <h3 className="mt-5 text-lg font-semibold text-gray-900">Sådd och utplantering</h3>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Sista frost är referenspunkten. Varma sommarväxter som tomat, paprika och chili sås
          inomhus 8–12 veckor före sista frost. Frosttoleranta växter som spenat, ärta och
          sallat kan direktsås redan när marken är arbetsbar — typiskt mars i Z1, april i Z3,
          maj i Z6+.
        </p>

        <h3 className="mt-5 text-lg font-semibold text-gray-900">Vilka växter passar?</h3>
        <p className="mt-2 text-gray-700 leading-relaxed">
          <strong>Z1–Z3 (södra och mellansverige):</strong> Allt går att odla — tomat, paprika,
          chili, ja även vinmelon i växthus.
          <br />
          <strong>Z4–Z5 (norra Svealand, södra Norrland):</strong> De flesta klassiska
          grönsakerna; vissa värmekrävande som paprika behöver växthus.
          <br />
          <strong>Z6–Z8 (Norrland och fjäll):</strong> Frosttoleranta växter dominerar — grönkål,
          rödbeta, morot, sallat, spenat, ärta, kålväxter. Tomat fungerar i växthus eller
          som frosttoleranta sorter ("Latah", "Glacier").
        </p>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Mikroklimat</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Officiella zoner är generella. Din specifika trädgård kan vara en hel zon varmare än
          omgivningen om du har söderläge mot en stenmur, eller en zon kallare om du bor i en
          dalgång där kalluft samlas. <strong>Pallkrage hjälper</strong> — den höjda jorden värms
          upp snabbare på våren och du kan ofta så 1–2 veckor tidigare än vid markodling i samma
          zon.
        </p>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Hitta din zon i appen</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          När du{' '}
          <Link href="/gardens/new" className="text-green-700 underline">skapar en odling</Link>{' '}
          på Kvadratodling kan du klicka din region på Sverigekartan så fyller vi i sista
          frostdatum automatiskt. Schemat anpassas sedan så att du får sådd-, utplanterings- och
          skördetider exakt för din zon.
        </p>

        <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-900">Vet du din zon?</h3>
          <p className="mt-1 text-sm text-green-800">
            Klicka din ort på kartan när du skapar din första odling, så får du ett
            skräddarsytt såschema.
          </p>
          <Link
            href="/gardens/new"
            className="mt-4 inline-block rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Skapa din första odling →
          </Link>
        </div>
      </section>
    </article>
  );
}

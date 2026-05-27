import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Hur mycket jord behöver en pallkrage, vad ska den innehålla och hur håller du den näringsrik? Komplett guide till Mel\'s Mix, svenska alternativ och årligt underhåll.';

export const metadata: Metadata = {
  title: 'Jord till pallkrage — Mel\'s Mix och svenska alternativ',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/jord-till-pallkrage' },
  keywords: [
    'jord pallkrage', 'pallkrage jord', "mel's mix",
    'kompost pallkrage', 'näring pallkrage', 'fylla pallkrage',
  ],
  openGraph: {
    title: 'Jord till pallkrage — komplett guide',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/jord-till-pallkrage`,
    type: 'article',
  },
};

export default function JordPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: "Jord till pallkrage — Mel's Mix och svenska alternativ",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/jord-till-pallkrage`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jord till pallkrage', item: `${SITE_URL}/jord-till-pallkrage` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Jord till pallkrage
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Pallkragens framgång beror till 80 % på jorden. En full pallkrage rymmer ungefär 100
          liter — det blir dyrt att slänga om man köper fel. Här är vad som funkar i Sverige,
          vad som finns att köpa, och hur du håller jorden levande år efter år.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Hur mycket jord behöver jag?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En standard <Link href="/pallkrage" className="text-green-700 underline">pallkrage</Link>{' '}
          (120 × 80 × 20 cm) rymmer ungefär:
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>1 krage (20 cm djup):</strong> ~190 liter (köp 200 L för säkerhets skull)</li>
          <li><strong>2 kragar staplade (40 cm):</strong> ~380 liter (~ 400 L)</li>
          <li><strong>3 kragar staplade (60 cm):</strong> ~570 liter (~ 600 L)</li>
        </ul>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Räkna med ~5 säckar planteringsjord à 40 L per pallkrage. Säckar à 50 kr i butik gör
          250 kr per krage; köpt på pall (1 m³) blir billigare per liter.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Klassisk "Mel&apos;s Mix"</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Mel Bartholomew, som uppfann kvadratmetoden, rekommenderade en tredjedelsblandning av:
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>1/3 mogen kompost</strong> — gärna från fler källor (köks, häst, kor)</li>
          <li><strong>1/3 torv eller kokosfiber</strong> — håller fukt och struktur</li>
          <li><strong>1/3 vermikulit</strong> — luckrar upp, håller näring</li>
        </ul>
        <p className="mt-3 text-gray-700 leading-relaxed">
          I praktiken är vermikulit svårhittat och dyrt i Sverige. Och torv är ifrågasatt
          klimatmässigt. Lyckligtvis finns bra svenska alternativ.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Svenskt alternativ</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En pragmatisk svensk blandning som funkar utmärkt i pallkrage:
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>60 % planteringsjord</strong> (Hasselfors Grön Linje eller motsvarande)</li>
          <li><strong>30 % mogen kompost</strong> (egenkomposterad eller köpt)</li>
          <li><strong>10 % naturgödsel</strong> (helst kalkad hönsgödsel eller kogödsel)</li>
        </ul>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Blanda i kärran innan du fyller pallkragen. Vattna efter blandning — låt sätta sig i
          några dagar innan du planterar.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vad ska du undvika?</h2>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>Trädgårdsjord från marken</strong>: innehåller ogräs-frön, sjukdomar och insekter. Pallkragens fördel är ren start — släng inte bort den</li>
          <li><strong>Färsk gödsel</strong>: bränner rötterna. Använd bara väl mogen kompost</li>
          <li><strong>Tung lerjord</strong>: drar inte luft, växterna kvävs</li>
          <li><strong>Renad sand</strong>: ingen näring, jord kollapsar och dräneras för mycket</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Toppdressning — året 2 och framåt</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Pallkragens jord sjunker ihop med 5–10 cm per år genom kompaktering och näringsutsuget.
          Varje vår: fyll på med <strong>5 cm färsk kompost</strong> på toppen. Det räcker som
          årlig grundgödsling.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          För <Link href="/catalog/tomat" className="text-green-700 underline">tomat</Link>,{' '}
          <Link href="/catalog/paprika" className="text-green-700 underline">paprika</Link> och
          andra storkrävande växter: toppdressa även mitt i säsongen (juli), 1 cm kompost runt
          basen.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">pH och näringsämnen</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          De flesta grönsaker trivs vid <strong>pH 6,0–7,0</strong> (något surt till neutralt).
          Köpt planteringsjord är vanligen pH 5,5–6,5 — bra. Kompost höjer pH lite över tid.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Specialfall: <Link href="/catalog/blabar" className="text-green-700 underline">blåbär</Link>{' '}
          behöver pH 4,5–5,5 (mycket surt) — separat pallkrage med torv- eller surjordblandning.
          Lök, kål och spenat vill ha pH 6,5–7,0 — tillsätt lite kalk om jorden är för sur.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vanliga fel</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>För lite kompost.</strong> Ren planteringsjord blir snabbt utarmad. Minst 25 %
          kompost i originalblandningen.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>För djupt med näring direkt.</strong> Färska komposter (mindre än 6 månader)
          kan bränna rötter och dra åt sig kväve under sin egen nedbrytning. Använd mogen
          kompost.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Ingen mulch.</strong> En oskyddad jordyta torkar 3 gånger snabbare och näring
          spolas bort vid regn. Mulcha med halm, gräsklipp eller bark efter plantering.
        </p>

        <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">Bygg din pallkrage från grunden</h2>
          <p className="mt-1 text-sm text-green-800">
            Skapa en odling — vi räknar ut hur många pallkragar som passar din yta och vad du
            kan så när.
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

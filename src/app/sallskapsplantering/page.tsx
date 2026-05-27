import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Sällskapsplantering är konsten att kombinera växter som hjälper varandra. Här är de viktigaste paren för svensk pallkrage-odling, och vilka du ska hålla isär.';

export const metadata: Metadata = {
  title: 'Sällskapsplantering — vilka växter trivs ihop?',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/sallskapsplantering' },
  keywords: [
    'sällskapsplantering', 'companion planting', 'vilka växter trivs ihop',
    'växter att kombinera', 'sambodling', 'sambodla grönsaker',
  ],
  openGraph: {
    title: 'Sällskapsplantering — guide för svenska köksträdgården',
    description: 'Klassiska växtkombinationer som ger större skörd och färre skadegörare.',
    url: `${SITE_URL}/sallskapsplantering`,
    type: 'article',
  },
};

const PAIRS = [
  {
    a: { slug: 'tomat', name: 'Tomat', emoji: '🍅' },
    b: { slug: 'basilika', name: 'Basilika', emoji: '🌿' },
    why: 'Klassisk pizza-kombination. Basilikan avskräcker bladlöss och vita flugor, och sägs förbättra tomatens smak. Båda trivs i samma sol och vattenmängd.',
  },
  {
    a: { slug: 'morot', name: 'Morot', emoji: '🥕' },
    b: { slug: 'gullok', name: 'Gul lök', emoji: '🧅' },
    why: 'Den klassiska "morot och lök"-allianzen. Lökens lukt förvirrar morotsflugan, och morotens lukt avskräcker lökflugan. Båda parter vinner.',
  },
  {
    a: { slug: 'salladsgurka', name: 'Salladsgurka', emoji: '🥒' },
    b: { slug: 'dill', name: 'Dill', emoji: '🌿' },
    why: 'Dillen lockar nyttoinsekter (parasitsteklar, blomflugor) som äter gurkbaggar. Och de samspelar i picklingen sedan.',
  },
  {
    a: { slug: 'morot', name: 'Morot', emoji: '🥕' },
    b: { slug: 'graslok', name: 'Gräslök', emoji: '🌿' },
    why: 'Gräslök fungerar som naturlig insektsavskräckare för moroten — särskilt mot bladlöss och morotsfluga.',
  },
  {
    a: { slug: 'tomat', name: 'Tomat', emoji: '🍅' },
    b: { slug: 'ringblomma', name: 'Ringblomma', emoji: '🌼' },
    why: 'Ringblommor släpper ut kemikalier i jorden som avskräcker nematoder från tomatens rötter. Dessutom drar de in pollinerare.',
  },
  {
    a: { slug: 'spenat', name: 'Spenat', emoji: '🥬' },
    b: { slug: 'arta', name: 'Ärta', emoji: '🌱' },
    view: 'good',
    why: 'Ärtans skugga skyddar spenaten från sommarvärme och förlänger skördesäsongen. Ärtor fixerar kväve som spenaten gladeligen utnyttjar.',
  },
  {
    a: { slug: 'huvudsallat', name: 'Huvudsallat', emoji: '🥬' },
    b: { slug: 'radisa', name: 'Rädisa', emoji: '🌶️' },
    why: 'Rädisor är skördade på 30 dagar medan sallatens huvud fortfarande utvecklas. Klassisk "intercropping" som maximerar varje pallkrage-ruta.',
  },
  {
    a: { slug: 'zucchini', name: 'Zucchini', emoji: '🥒' },
    b: { slug: 'ringblomma', name: 'Ringblomma', emoji: '🌼' },
    why: 'Ringblommor lockar pollinerare som zucchinin desperat behöver — pollineringsbrist är den vanligaste orsaken till små, gula frukter som faller av.',
  },
];

const ANTAGONISTS = [
  { a: 'Tomat', b: 'Potatis', why: 'Båda är i nattskattefamiljen och delar samma sjukdomar (bladmögel). Sprider mellan varandra.' },
  { a: 'Lök / vitlök', b: 'Bönor / ärtor', why: 'Lök-släktet hämmar baljväxters kvävefixering. Båda växer sämre när de står tillsammans.' },
  { a: 'Dill', b: 'Morot (vuxen)', why: 'Båda i flockblommiga familjen, konkurrerar om samma näring när moroten ska bli stor. Som unga är de däremot bra grannar.' },
  { a: 'Sallat', b: 'Selleri', why: 'Selleri sägs hämma sallatens tillväxt — undvik i samma pallkrage.' },
];

export default function SallskapsplanteringPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Sällskapsplantering — vilka växter trivs ihop?',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/sallskapsplantering`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Sällskapsplantering', item: `${SITE_URL}/sallskapsplantering` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Sällskapsplantering
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Sällskapsplantering är konsten att kombinera växter som hjälper varandra — eller att
          undvika de kombinationer som hämmar. En väl planerad pallkrage ger större skörd och
          färre skadegörare än samma växter utspridda var för sig.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Varför funkar det?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Tre mekanismer ligger bakom sällskapsplantering: <strong>doftavskräckning</strong> (en
          stark lukt förvirrar skadeinsekter), <strong>nyttoinsekter</strong> (en växt drar
          pollinerare eller naturliga fiender till skadegörare), och{' '}
          <strong>jordkemi</strong> (vissa rotutsöndringar gynnar eller hämmar grannplantor).
          Klassiska kombinationer som "morot och lök" baseras på alla tre.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Det är inte exakt vetenskap — många "klassiska" råd är folklore mer än bevisat — men
          tillräckligt välbevittnat för att det är värt att följa. I värsta fall: ingen skillnad.
          I bästa fall: hälften så mycket bladlöss.
        </p>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">8 klassiska par för svensk pallkrage</h2>

        <div className="mt-4 space-y-4">
          {PAIRS.map((p, i) => (
            <div key={i} className="rounded-xl border border-green-100 bg-green-50/50 p-5">
              <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-900">
                <Link href={`/catalog/${p.a.slug}`} className="hover:text-green-700">
                  {p.a.emoji} {p.a.name}
                </Link>
                <span className="text-green-600">+</span>
                <Link href={`/catalog/${p.b.slug}`} className="hover:text-green-700">
                  {p.b.emoji} {p.b.name}
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{p.why}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Undvik dessa kombinationer</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-red-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-50">
              <tr className="text-xs uppercase tracking-wide text-red-800">
                <th className="px-4 py-3">Växt</th>
                <th className="px-4 py-3">Undvik bredvid</th>
                <th className="px-4 py-3">Varför</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100 bg-white">
              {ANTAGONISTS.map((a, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.a}</td>
                  <td className="px-4 py-3 text-gray-900">{a.b}</td>
                  <td className="px-4 py-3 text-gray-600">{a.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Pallkrage-specifika tips</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          I en standardpallkrage med 12 rutor är avstånden så små att grannrutor verkligen
          påverkar varandra. Använd det medvetet: placera tomat och basilika bredvid varandra
          istället för i olika hörn. Sätt en ringblomma i varje hörn — fungerar som
          pollinerar-magneter och ser dessutom vackert ut.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Och inverteringen är lika viktig: en pallkrage där tomat och potatis står bredvid
          varandra är en katastrof som väntar på att hända. Bladmögel sprids på en eftermiddag.
        </p>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Använd planeraren</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          När du planerar din pallkrage på Kvadratodling visas{' '}
          <Link href="/gardens/new" className="text-green-700 underline">automatiskt</Link>{' '}
          goda och dåliga grannar för varje växt du väljer — så du slipper komma ihåg listorna
          ovan. Vi har över 1000 dokumenterade växtkombinationer i databasen.
        </p>

        <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-900">Planera din pallkrage</h3>
          <p className="mt-1 text-sm text-green-800">
            Få sällskapsplanterings-tips direkt i planeraren för varje växt du väljer.
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

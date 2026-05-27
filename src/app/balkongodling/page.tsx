import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Balkongodling i Sverige — vad funkar i 30 × 60 cm-balkonglåda, sol-krav, vattning, vinterförvaring och de bästa växterna för en liten yta.';

export const metadata: Metadata = {
  title: 'Balkongodling — odla i lådor på balkongen',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/balkongodling' },
  keywords: [
    'balkongodling', 'balkonglåda', 'odla på balkong',
    'pallkrage balkong', 'odla i kruka', 'urban odling',
  ],
  openGraph: {
    title: 'Balkongodling — guide för svenska balkonger',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/balkongodling`,
    type: 'article',
  },
};

export default function BalkongodlingPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Balkongodling — odla i lådor på balkongen',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/balkongodling`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Balkongodling', item: `${SITE_URL}/balkongodling` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Balkongodling
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Du behöver inte en trädgård för att odla. En 1 m² balkong räcker för en husbehovssäsong
          med tomater, sallat, kryddor och kanske till och med några morötter. Här är hur du
          maximerar utbytet på liten yta.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Balkonglåda vs pallkrage</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En balkonglåda är vad det låter som — en avlång krukbehållare, oftast 60–120 cm lång
          och 20–30 cm djup. Står på balkonggolvet eller hängs på balkongräcket.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En <Link href="/pallkrage" className="text-green-700 underline">pallkrage</Link> är
          större (120 × 80 cm) och passar bara om du har bred balkong eller terrass. Är din
          balkong smalare: tänk lådor.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Båda funkar med <strong>kvadratmetoden</strong> — varje 30 × 30 cm-yta planteras med
          bestämt antal växter. En 60 × 30 cm balkonglåda rymmer 2 rutor.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vilka växter passar?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Tre kriterier: <strong>kompakt växtsätt</strong>, <strong>klarar kruka</strong>,
          <strong> tål viss torka</strong> (balkongerna torkar snabbare än markodling).
        </p>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Bästa val för balkong</h3>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><Link href="/catalog/cherry-tomato" className="text-green-700 underline">Cherrytomat</Link> — kompakta buskformade sorter. Givande hela sommaren</li>
          <li><Link href="/catalog/huvudsallat" className="text-green-700 underline">Sallat och rucola</Link> — kort cykel, kontinuerlig skörd</li>
          <li><Link href="/catalog/basilika" className="text-green-700 underline">Basilika</Link>, <Link href="/catalog/persilja" className="text-green-700 underline">persilja</Link>, <Link href="/catalog/graslok" className="text-green-700 underline">gräslök</Link>, <Link href="/catalog/dill" className="text-green-700 underline">dill</Link> — alla kryddor älskar balkong</li>
          <li><Link href="/catalog/jordgubbe" className="text-green-700 underline">Jordgubbe</Link> — perfekt i hänglådor; bär kan inte vidröra mark = ingen mögel</li>
          <li><Link href="/catalog/radisa" className="text-green-700 underline">Rädisa</Link> — snabb och tacksam för impatient odlare</li>
          <li><Link href="/catalog/chili" className="text-green-700 underline">Chili</Link>, <Link href="/catalog/jalapeno" className="text-green-700 underline">jalapeño</Link> — kompakt, tål att stå i kruka, kan tas in vintertid</li>
          <li><Link href="/catalog/morot" className="text-green-700 underline">Morot</Link> — bara sorter med korta rötter (Paris Market, Amsterdam Forcing) i 20 cm djup</li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-gray-900">Undvik på balkong</h3>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><Link href="/catalog/pumpa" className="text-green-700 underline">Pumpa</Link>, <Link href="/catalog/zucchini" className="text-green-700 underline">zucchini</Link> — för stora rankor, tar över allt</li>
          <li><Link href="/catalog/majs" className="text-green-700 underline">Majs</Link> — behöver block för pollinering, sällan lyckosamt på balkong</li>
          <li><Link href="/catalog/palsternacka" className="text-green-700 underline">Palsternacka</Link> — för djupa rötter för standardlåda</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Sol-krav</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Sol är det enskilt viktigaste på balkong. <strong>Söder- eller västläge</strong> är
          ideal — minst 6 timmar direkt sol/dag för grönsaksväxter.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Norr- eller östläge: håll dig till bladväxter (sallat, spenat, mangold, rucola),
          kryddor (persilja, gräslök, mynta) och eventuellt jordgubbe. Glöm tomat och paprika i
          dessa lägen.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vatten — mer än du tror</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Krukor torkar 3–5 gånger snabbare än markjord. På varma julidagar kan en balkongkruka
          behöva vatten <strong>dagligen</strong> — ibland morgon och kväll. Det är därför många
          balkongodlare slutar — semesterresan blir omöjlig.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Lösningar: självvattnande lådor (bottenvatten via reservoir), droppslang ansluten till
          klocka, eller "blött handduk"-metoden där en bomullshandduk hänger ner i ett vattenfat
          och fukten dras upp genom kapillärkraft.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vinterförvaring</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Krukor är mer frostkänsliga än markodling — rotsystemet utsätts för kyla från alla
          håll. Två strategier:
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>Ettåriga växter</strong> (tomat, sallat etc): ta ner krukor, töm jorden i komposten, förvara krukor inne</li>
          <li><strong>Fleråriga växter</strong> (jordgubbe, kryddor, krukfruktbuskar): packa krukor i bubbelplast eller flytta in i kall källare/vindfång</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Layout-tips för 1 m² balkong</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En typisk svensk balkong är 1–2 meter djup och 4–6 meter bred. En realistisk yta för
          odling är 1 m². Vad får plats?
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li>1 cherrytomat-planta i 30 L kruka</li>
          <li>1 basilika-planta i 5 L kruka (vid tomaten)</li>
          <li>1 chili-planta i 10 L kruka</li>
          <li>1 balkonglåda 80 × 30 cm med sallat (4 plantor) + gräslök (16 plantor)</li>
          <li>1 hängande jordgubbskorg med 3 plantor</li>
        </ul>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Det är mat för en familj 2–3 dagar/vecka under hela sommaren.
        </p>

        <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">Planera din balkong</h2>
          <p className="mt-1 text-sm text-green-800">
            Skapa en odling och ange din yta — vi räknar ut hur många balkonglådor som passar
            och vad du kan så.
          </p>
          <Link
            href="/gardens/new"
            className="mt-4 inline-block rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Planera din balkong →
          </Link>
        </div>
      </section>
    </article>
  );
}

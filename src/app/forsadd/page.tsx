import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Komplett guide till försådd inomhus — vilka växter, utrustning, timing per svensk zon, vanliga problem och hur du härdar av plantorna. Vägen till en lyckad odlingssäsong börjar i februari.';

export const metadata: Metadata = {
  title: 'Försådd inomhus — komplett guide för svenska odlare',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/forsadd' },
  keywords: [
    'försådd', 'så inomhus', 'när så tomater', 'när så paprika', 'när så chili',
    'sticklingsljus', 'försådd tomat', 'försådd schema',
  ],
  openGraph: {
    title: 'Försådd inomhus — guide för svenska odlare',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/forsadd`,
    type: 'article',
  },
};

export default function ForsaddPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Försådd inomhus — komplett guide',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/forsadd`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Försådd', item: `${SITE_URL}/forsadd` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Försådd inomhus
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Att så inomhus är skillnaden mellan en kort skuren odlingssäsong och en lång och frodig
          säsong. För värmekrävande växter som tomat, paprika och chili är det helt enkelt enda
          sättet att hinna få mogna skördar i svenskt klimat. Här är allt du behöver veta.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vad är försådd?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Försådd är att starta sina växter inomhus 4–12 veckor innan de kan stå ute, så att de
          har ett rejält försprång när sommaren kommer. Du sår i små krukor eller pluggbrätten,
          flyttar plantorna när de har 4–6 blad, härdar av dem och planterar ut när nattfrosten
          är säkert förbi.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Den enskilt största hävstången för en svensk pallkrage-odlare. Utan försådd missar du
          tomater, paprika, chili, aubergine, basilika, lavendel och flera höstkålssorter helt.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vilka växter ska försås?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Som tumregel: värmekrävande växter med lång säsong försås, frostt­oleranta direktsås.
        </p>
        <h3 className="mt-5 text-lg font-semibold text-gray-900">Måste-försås (8–12 veckor före utplantering)</h3>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><Link href="/catalog/tomat" className="text-green-700 underline">Tomat</Link>, <Link href="/catalog/cherry-tomato" className="text-green-700 underline">cherrytomat</Link> — 8–10 veckor</li>
          <li><Link href="/catalog/paprika" className="text-green-700 underline">Paprika</Link>, <Link href="/catalog/chili" className="text-green-700 underline">chili</Link>, <Link href="/catalog/jalapeno" className="text-green-700 underline">jalapeño</Link> — 10–12 veckor</li>
          <li><Link href="/catalog/aubergine" className="text-green-700 underline">Aubergine</Link> — 10–12 veckor</li>
          <li><Link href="/catalog/basilika" className="text-green-700 underline">Basilika</Link> — 6–8 veckor</li>
        </ul>
        <h3 className="mt-5 text-lg font-semibold text-gray-900">Bra att försås (4–6 veckor)</h3>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><Link href="/catalog/salladsgurka" className="text-green-700 underline">Salladsgurka</Link>, <Link href="/catalog/zucchini" className="text-green-700 underline">zucchini</Link>, <Link href="/catalog/pumpa" className="text-green-700 underline">pumpa</Link> — 3–4 veckor</li>
          <li><Link href="/catalog/broccoli" className="text-green-700 underline">Broccoli</Link>, <Link href="/catalog/blomkal" className="text-green-700 underline">blomkål</Link>, <Link href="/catalog/gronkal" className="text-green-700 underline">grönkål</Link> — 4–6 veckor</li>
          <li><Link href="/catalog/huvudsallat" className="text-green-700 underline">Huvudsallat</Link> — 3–4 veckor för försprång</li>
          <li><Link href="/catalog/oregano" className="text-green-700 underline">Oregano</Link>, <Link href="/catalog/persilja" className="text-green-700 underline">persilja</Link> — 6–8 veckor</li>
        </ul>
        <h3 className="mt-5 text-lg font-semibold text-gray-900">Direktsås (försås inte)</h3>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><Link href="/catalog/morot" className="text-green-700 underline">Morot</Link>, <Link href="/catalog/palsternacka" className="text-green-700 underline">palsternacka</Link> — pålrot tål inte flytt</li>
          <li><Link href="/catalog/radisa" className="text-green-700 underline">Rädisa</Link> — för snabb, ingen poäng</li>
          <li><Link href="/catalog/arta" className="text-green-700 underline">Ärta</Link>, <Link href="/catalog/sockerart" className="text-green-700 underline">sockerärta</Link>, <Link href="/catalog/brytbona" className="text-green-700 underline">brytböna</Link> — gror snabbt direkt</li>
          <li><Link href="/catalog/spenat" className="text-green-700 underline">Spenat</Link>, <Link href="/catalog/ruccola" className="text-green-700 underline">rucola</Link> — kalltoleranta</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Utrustning</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Du klarar dig långt med en fönsterbräda i söderläge och plastkrukor. Men för riktig
          framgång — särskilt med paprika och chili som behöver flera månader på sig — vill du ha:
        </p>
        <ul className="mt-3 space-y-1 text-gray-700">
          <li><strong>Pluggbrätten eller småkrukor:</strong> 5–8 cm är lagom för start</li>
          <li><strong>Plantjord</strong> (fin, näringsfattig) — inte sockerjord</li>
          <li><strong>Värmematta</strong> för paprika/chili (gror vid 25 °C)</li>
          <li><strong>Växtljus / lysrör</strong> — svenska februaridagar är för korta. Plantor blir gänglade utan extra ljus</li>
          <li><strong>Bevattning från undersidan</strong> — undvik mögel ovanpå jorden</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Timing — när ska du så?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Räkna baklänges från din sista frost. För tomat (8 veckor): om sista frost är 15 maj så
          ska du så 20 mars. För paprika (12 veckor): så 22 februari.{' '}
          <Link href="/verktyg/frostkalkylator" className="text-green-700 underline">
            Frostkalkylatorn
          </Link>{' '}
          ger dig sista frost för din zon på 10 sekunder.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Standardvecka för svensk försådd:
        </p>
        <ul className="mt-2 space-y-1 text-gray-700">
          <li><strong>Vecka 6–8 (mitten av februari):</strong> paprika, chili, aubergine</li>
          <li><strong>Vecka 10–12 (mitten av mars):</strong> tomat, basilika</li>
          <li><strong>Vecka 14–16 (början av april):</strong> kålväxter, sallat, gurka, zucchini</li>
          <li><strong>Vecka 18+ (början av maj):</strong> sista omgång snabbväxare</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vanliga problem</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Gängliga plantor (etiolering):</strong> Plantan blir lång, smal, blek — för
          lite ljus. Lös med växtlampa eller flytta till bättre söderläge.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Bortdöende plantor (damping off):</strong> Plantan vissnar plötsligt vid basen.
          Mögel orsakat av för fuktig jord + dålig ventilation. Lös genom att vattna underifrån
          och låta jorden torka mellan vattningar.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Plantor sluttar inte växa:</strong> Antingen för kallt (paprika behöver 25 °C
          för att gro) eller näringsbrist (efter 4 veckor i pluggbrätt). Plantera om till större
          kruka med kompostrik jord.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Härdning av — det viktigaste steget</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Inomhusväxta plantor kan inte bara flyttas ut — de bränner sig på sol och vissnar i
          vind. <strong>Härdning</strong> är en 7–14 dagars vänjningsperiod:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-gray-700">
          <li>Dag 1–2: 1 timme utomhus i skugga</li>
          <li>Dag 3–4: 3 timmar utomhus i halvskugga</li>
          <li>Dag 5–7: hela dagen utomhus, in på natten</li>
          <li>Dag 8–14: ute hela tiden, tak över vid frostrisk</li>
        </ol>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Plantor som inte härdas drabbas av "solbränna" — vita fläckar på bladen som inte läker.
          Plantan överlever men sätter tillbaka 2 veckor.
        </p>

        <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-900">Få ditt personliga försådd-schema</h3>
          <p className="mt-1 text-sm text-green-800">
            Skapa en odling och välj din zon — vi räknar ut exakt vilka datum du ska så vad,
            specifikt för din region.
          </p>
          <Link
            href="/gardens/new"
            className="mt-4 inline-block rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Skapa din försådd-plan →
          </Link>
        </div>
      </section>
    </article>
  );
}

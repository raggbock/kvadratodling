import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Månadsvis odlingsguide — vad ska du så, plantera och skörda i januari, februari, mars och resten av året i Sverige? Klar översikt månad för månad.';

export const metadata: Metadata = {
  title: 'Vad så i januari–december? Månadsvis odlingsguide',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/odla-manadsvis' },
  keywords: [
    'vad så i januari', 'vad så i februari', 'vad så i mars', 'vad så i april',
    'vad så i maj', 'vad så i juni', 'vad så i juli', 'vad så i augusti',
    'odling månad', 'månadsvis odling', 'odlingskalender',
  ],
  openGraph: {
    title: 'Månadsvis odlingsguide — vad så när?',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/odla-manadsvis`,
    type: 'article',
  },
};

interface MonthData {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  sow_indoors?: { slug: string; name: string; emoji: string }[];
  direct_sow?: { slug: string; name: string; emoji: string }[];
  transplant?: { slug: string; name: string; emoji: string }[];
  harvest?: { slug: string; name: string; emoji: string }[];
  tasks?: string[];
}

const MONTHS: MonthData[] = [
  {
    id: 'januari', name: 'Januari', emoji: '❄️',
    theme: 'Planering och förberedelse. Beställ fröna nu medan utbudet är som störst.',
    sow_indoors: [{ slug: 'chili', name: 'Chili', emoji: '🌶️' }, { slug: 'paprika', name: 'Paprika', emoji: '🫑' }],
    tasks: ['Beställ frön och sättpotatis', 'Planera odlingen — välj presets eller bygg eget', 'Skissa pallkrage-layout'],
  },
  {
    id: 'februari', name: 'Februari', emoji: '🌱',
    theme: 'Försådd startar på riktigt. Värmekrävande växter som behöver lång säsong går först.',
    sow_indoors: [
      { slug: 'paprika', name: 'Paprika', emoji: '🫑' },
      { slug: 'chili', name: 'Chili', emoji: '🌶️' },
      { slug: 'jalapeno', name: 'Jalapeño', emoji: '🌶️' },
      { slug: 'aubergine', name: 'Aubergine', emoji: '🍆' },
    ],
    tasks: ['Sätt igång värmematta för paprika/chili', 'Sätt upp växtlampa om du inte har stark söderfönsterplats'],
  },
  {
    id: 'mars', name: 'Mars', emoji: '🌷',
    theme: 'Försådd högsäsong. Tomater och kålväxter dras igång. Direktsådd börjar i söder.',
    sow_indoors: [
      { slug: 'tomat', name: 'Tomat', emoji: '🍅' },
      { slug: 'broccoli', name: 'Broccoli', emoji: '🥦' },
      { slug: 'blomkal', name: 'Blomkål', emoji: '🥬' },
      { slug: 'huvudsallat', name: 'Huvudsallat', emoji: '🥬' },
    ],
    direct_sow: [
      { slug: 'spenat', name: 'Spenat', emoji: '🥬' },
      { slug: 'arta', name: 'Ärta', emoji: '🌱' },
      { slug: 'radisa', name: 'Rädisa', emoji: '🌶️' },
      { slug: 'morot', name: 'Morot (Z1–Z2)', emoji: '🥕' },
    ],
    tasks: ['Förgrod sättpotatis 3–4 veckor före sättning', 'Mata fönsterbrädan-plantor med svag näringsblandning'],
  },
  {
    id: 'april', name: 'April', emoji: '🌿',
    theme: 'Vårsådd överallt. Lök och sättpotatis sätts. Plantering ute i söder börjar.',
    sow_indoors: [
      { slug: 'basilika', name: 'Basilika', emoji: '🌿' },
      { slug: 'salladsgurka', name: 'Salladsgurka', emoji: '🥒' },
      { slug: 'zucchini', name: 'Zucchini', emoji: '🥒' },
      { slug: 'pumpa', name: 'Pumpa', emoji: '🎃' },
    ],
    direct_sow: [
      { slug: 'morot', name: 'Morot', emoji: '🥕' },
      { slug: 'rodbeta', name: 'Rödbeta', emoji: '🍠' },
      { slug: 'palsternacka', name: 'Palsternacka', emoji: '🥕' },
      { slug: 'dill', name: 'Dill', emoji: '🌿' },
      { slug: 'koriander', name: 'Koriander', emoji: '🌿' },
    ],
    tasks: ['Sätt gullök, rödlök, salladslök', 'Sätt sättpotatis i söder', 'Börja härdning av tidigaste plantor'],
  },
  {
    id: 'maj', name: 'Maj', emoji: '🌸',
    theme: 'Utplantering för icke-frostkänsliga växter. Pallkragen fylls.',
    direct_sow: [
      { slug: 'brytbona', name: 'Brytböna', emoji: '🌱' },
      { slug: 'sockerart', name: 'Sockerärta', emoji: '🌱' },
      { slug: 'mangold', name: 'Mangold', emoji: '🥬' },
      { slug: 'majs', name: 'Sockermajs', emoji: '🌽' },
    ],
    transplant: [
      { slug: 'huvudsallat', name: 'Huvudsallat', emoji: '🥬' },
      { slug: 'broccoli', name: 'Broccoli', emoji: '🥦' },
      { slug: 'gronkal', name: 'Grönkål', emoji: '🥬' },
    ],
    tasks: ['Avsluta härdning av tomater, paprika, chili', 'Plantera ut efter sista frost i din zon'],
  },
  {
    id: 'juni', name: 'Juni', emoji: '☀️',
    theme: 'Frostkänsliga växter ut. Direktsådd succession för bladväxter.',
    transplant: [
      { slug: 'tomat', name: 'Tomat', emoji: '🍅' },
      { slug: 'paprika', name: 'Paprika', emoji: '🫑' },
      { slug: 'chili', name: 'Chili', emoji: '🌶️' },
      { slug: 'basilika', name: 'Basilika', emoji: '🌿' },
      { slug: 'salladsgurka', name: 'Salladsgurka', emoji: '🥒' },
      { slug: 'zucchini', name: 'Zucchini', emoji: '🥒' },
    ],
    direct_sow: [{ slug: 'huvudsallat', name: 'Sallat (omgång 2)', emoji: '🥬' }],
    harvest: [{ slug: 'radisa', name: 'Rädisa', emoji: '🌶️' }, { slug: 'ruccola', name: 'Rucola', emoji: '🥗' }],
    tasks: ['Mulcha tomater och gurkor', 'Sätt klätterstöd för tomat och bönor'],
  },
  {
    id: 'juli', name: 'Juli', emoji: '🌞',
    theme: 'Mitt i säsongen. Skörd börjar. Höstodling sås nu.',
    direct_sow: [
      { slug: 'gronkal', name: 'Grönkål (vinterskörd)', emoji: '🥬' },
      { slug: 'spenat', name: 'Spenat (höstomgång)', emoji: '🥬' },
      { slug: 'pak-choi', name: 'Pak choi', emoji: '🥬' },
    ],
    harvest: [
      { slug: 'sockerart', name: 'Sockerärta', emoji: '🌱' },
      { slug: 'huvudsallat', name: 'Huvudsallat', emoji: '🥬' },
      { slug: 'gullok', name: 'Färska lökar', emoji: '🧅' },
      { slug: 'jordgubbe', name: 'Jordgubbe', emoji: '🍓' },
    ],
    tasks: ['Plocka regelbundet — fler plockar = fler producerar', 'Vattna djupt 2 ggr/vecka'],
  },
  {
    id: 'augusti', name: 'Augusti', emoji: '🌾',
    theme: 'Skördens kulmen. Vitlök sätts för nästa år. Vinter-höstplantor in.',
    direct_sow: [{ slug: 'ruccola', name: 'Rucola (höstomgång)', emoji: '🥗' }],
    transplant: [{ slug: 'gronkal', name: 'Grönkål (vinter)', emoji: '🥬' }],
    harvest: [
      { slug: 'tomat', name: 'Tomat', emoji: '🍅' },
      { slug: 'gurka', name: 'Gurka', emoji: '🥒' },
      { slug: 'zucchini', name: 'Zucchini', emoji: '🥒' },
      { slug: 'gullok', name: 'Gul lök (mogen)', emoji: '🧅' },
      { slug: 'vitlok', name: 'Vitlök', emoji: '🧄' },
    ],
    tasks: ['Skörda lök när blasten gulnat', 'Beställ vitlöksklyftor för höstplantering'],
  },
  {
    id: 'september', name: 'September', emoji: '🍂',
    theme: 'Höstskörd. Förvaring och inkokning. Sätt jordgubbar för nästa år.',
    harvest: [
      { slug: 'tomat', name: 'Tomat (sista)', emoji: '🍅' },
      { slug: 'rodbeta', name: 'Rödbeta', emoji: '🍠' },
      { slug: 'morot', name: 'Morot', emoji: '🥕' },
      { slug: 'broccoli', name: 'Broccoli', emoji: '🥦' },
      { slug: 'pumpa', name: 'Pumpa', emoji: '🎃' },
    ],
    tasks: ['Sätt nya jordgubbsplantor', 'Bevattningen kan trappas ner'],
  },
  {
    id: 'oktober', name: 'Oktober', emoji: '🍁',
    theme: 'Vinterförberedelse. Vitlök i jorden. Sista skördar.',
    harvest: [
      { slug: 'palsternacka', name: 'Palsternacka', emoji: '🥕' },
      { slug: 'gronkal', name: 'Grönkål', emoji: '🥬' },
      { slug: 'rodkal', name: 'Rödkål', emoji: '🥬' },
    ],
    tasks: ['Sätt vitlöksklyftor (Z1–Z4)', 'Mulcha pallkragen för vintern', 'Skydda kvarvarande växter mot frost'],
  },
  {
    id: 'november', name: 'November', emoji: '❄️',
    theme: 'Allt vinterförberett. Sista chansen sätta vitlök i Z1–Z3.',
    harvest: [{ slug: 'gronkal', name: 'Grönkål (vintervariant)', emoji: '🥬' }, { slug: 'purjolok', name: 'Purjolök', emoji: '🧅' }],
    tasks: ['Avsluta vitlök-plantering i söder', 'Skydda buskar (hallon, blåbär) med granris'],
  },
  {
    id: 'december', name: 'December', emoji: '🎄',
    theme: 'Vila för pallkragen. Tid för planering av nästa år.',
    tasks: ['Utvärdera årets odling — vilka växter funkade?', 'Beställ nya fröna inför januari', 'Läs på om nya tekniker'],
  },
];

function PlantPill({ slug, emoji, name }: { slug: string; emoji: string; name: string }) {
  return (
    <Link
      href={`/catalog/${slug}`}
      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:ring-green-300"
    >
      <span>{emoji}</span>
      <span>{name}</span>
    </Link>
  );
}

export default function OdlaManadsvisPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Månadsvis odlingsguide — vad så när?',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/odla-manadsvis`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Månadsvis', item: `${SITE_URL}/odla-manadsvis` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Vad så när? — månadsvis odlingsguide
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Översikt över sådd, plantering och skörd månad för månad — anpassad efter svenska
          klimatet. Exakta datum varierar 1–2 veckor mellan zonerna; se{' '}
          <Link href="/odlingsschema" className="text-green-700 underline">
            zonsspecifikt schema
          </Link>{' '}
          för exakt timing.
        </p>
      </header>

      {/* Quick nav */}
      <nav className="mb-8 flex flex-wrap gap-1.5 rounded-xl border border-gray-100 bg-white p-3">
        {MONTHS.map((m) => (
          <a
            key={m.id}
            href={`#${m.id}`}
            className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-100"
          >
            {m.name.slice(0, 3)}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        {MONTHS.map((m) => (
          <section key={m.id} id={m.id} className="scroll-mt-4">
            <header className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {m.emoji} {m.name}
              </h2>
            </header>
            <p className="mb-4 text-gray-600">{m.theme}</p>

            {m.sow_indoors && m.sow_indoors.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-700">
                  Så inomhus
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {m.sow_indoors.map((p) => <PlantPill key={p.slug} {...p} />)}
                </div>
              </div>
            )}

            {m.direct_sow && m.direct_sow.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-700">
                  Direktsådd
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {m.direct_sow.map((p) => <PlantPill key={p.slug} {...p} />)}
                </div>
              </div>
            )}

            {m.transplant && m.transplant.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                  Plantera ut
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {m.transplant.map((p) => <PlantPill key={p.slug} {...p} />)}
                </div>
              </div>
            )}

            {m.harvest && m.harvest.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-700">
                  Skörd
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {m.harvest.map((p) => <PlantPill key={p.slug} {...p} />)}
                </div>
              </div>
            )}

            {m.tasks && m.tasks.length > 0 && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <strong className="text-gray-900">Att göra:</strong>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {m.tasks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">Skräddarsy schemat för din zon</h2>
        <p className="mt-1 text-sm text-green-800">
          Skapa en odling med din region så får du exakta datum för varje sådd och skörd.
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'När är dina grönsaker mogna? Praktisk skördetider-guide för svensk pallkrage — när skördas tomat, morot, lök, vitlök och resten? Tecken på mognad och förvaringstips.';

export const metadata: Metadata = {
  title: 'Skördetider — när är dina grönsaker mogna?',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/skordetider' },
  keywords: [
    'skördetider', 'när skörda tomat', 'när skörda morot', 'när skörda lök',
    'när är pumpa mogen', 'mogen vitlök', 'svensk skördetid',
  ],
  openGraph: {
    title: 'Skördetider — när är dina grönsaker mogna?',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/skordetider`,
    type: 'article',
  },
};

interface HarvestRow {
  category: string;
  plants: {
    slug: string;
    name: string;
    emoji: string;
    season: string;
    ripeWhen: string;
    storage: string;
  }[];
}

const TABLE: HarvestRow[] = [
  {
    category: 'Snabba bladväxter',
    plants: [
      { slug: 'radisa', name: 'Rädisa', emoji: '🌶️', season: 'Mitten av maj–oktober', ripeWhen: 'Roten 2–3 cm i diameter, känns fast', storage: 'Inom 1 vecka i kyl' },
      { slug: 'ruccola', name: 'Rucola', emoji: '🥗', season: 'Maj–oktober', ripeWhen: 'Bladen 10–15 cm, innan blomning', storage: '3–5 dagar i kyl' },
      { slug: 'huvudsallat', name: 'Huvudsallat', emoji: '🥬', season: 'Juni–september', ripeWhen: 'Huvudet fast, innan långa stjälken bildas', storage: '1 vecka i kyl' },
      { slug: 'spenat', name: 'Spenat', emoji: '🥬', season: 'Maj–juni, sept–okt', ripeWhen: 'Bladen 8–12 cm, innan plantan blommar', storage: '3 dagar i kyl, frys för längre' },
      { slug: 'mangold', name: 'Mangold', emoji: '🥬', season: 'Juli–oktober', ripeWhen: 'Yttre blad 20–25 cm', storage: '5 dagar i kyl' },
      { slug: 'pak-choi', name: 'Pak choi', emoji: '🥬', season: 'Juni–juli, sept–okt', ripeWhen: 'Stjälkbas 4–6 cm', storage: '1 vecka i kyl' },
    ],
  },
  {
    category: 'Rotfrukter',
    plants: [
      { slug: 'morot', name: 'Morot', emoji: '🥕', season: 'Juli (tidig) till okt', ripeWhen: 'Roten 1,5–3 cm vid jordytan; tidigsorter mindre', storage: 'Sand i källare, 4–6 mån' },
      { slug: 'rodbeta', name: 'Rödbeta', emoji: '🍠', season: 'Juli–oktober', ripeWhen: 'Roten 5–8 cm; större = trådigt', storage: 'Sand i källare, eller picklad' },
      { slug: 'palsternacka', name: 'Palsternacka', emoji: '🥕', season: 'September–november', ripeWhen: 'Efter första frosten är sötast', storage: 'Sand i källare, hela vintern' },
      { slug: 'potatis', name: 'Potatis', emoji: '🥔', season: 'Juli (primör) – sept (förvaring)', ripeWhen: 'Blasten gulnar och faller', storage: 'Svalt + mörkt, 4–6 månader' },
      { slug: 'kalrot', name: 'Kålrot', emoji: '🥕', season: 'Oktober–november', ripeWhen: 'Roten 10–15 cm i diameter', storage: 'Sand i källare, hela vintern' },
    ],
  },
  {
    category: 'Lök och vitlök',
    plants: [
      { slug: 'salladslok', name: 'Salladslök', emoji: '🌿', season: 'Maj–oktober', ripeWhen: 'Stjälken 25–30 cm', storage: '1 vecka i kyl, eller hackad och fryst' },
      { slug: 'gullok', name: 'Gul lök', emoji: '🧅', season: 'Juli–augusti', ripeWhen: 'Blasten gulnar och tippar över', storage: 'Svalt + torrt, 6–9 mån' },
      { slug: 'vitlok', name: 'Vitlök', emoji: '🧄', season: 'Juli', ripeWhen: 'Nedre 3–4 blad gulnat, övre fortfarande gröna', storage: 'Svalt + torrt, 6–12 mån' },
      { slug: 'purjolok', name: 'Purjolök', emoji: '🧅', season: 'Augusti–november', ripeWhen: 'Stjälken 2–3 cm i diameter', storage: 'I marken över vintern, eller kyl 2 v' },
    ],
  },
  {
    category: 'Frukter och baljväxter',
    plants: [
      { slug: 'tomat', name: 'Tomat', emoji: '🍅', season: 'Juli–oktober', ripeWhen: 'Lossnar lätt vid lätt vridning, fullt färg', storage: 'Rumstemp 3–5 dgr; aldrig i kyl' },
      { slug: 'paprika', name: 'Paprika', emoji: '🫑', season: 'Juli–oktober', ripeWhen: 'Grön = unmogen men ätbar; röd/gul = mogen', storage: '1 vecka i kyl' },
      { slug: 'chili', name: 'Chili', emoji: '🌶️', season: 'Juli–oktober', ripeWhen: 'Stark färg, lossnar lätt', storage: 'Torka i kedjor, eller pickla' },
      { slug: 'salladsgurka', name: 'Salladsgurka', emoji: '🥒', season: 'Juli–september', ripeWhen: '15–20 cm långa, mjukt gröna', storage: '1 vecka i kyl' },
      { slug: 'zucchini', name: 'Zucchini', emoji: '🥒', season: 'Juli–september', ripeWhen: '15–20 cm; större = vattnig', storage: '1 vecka i kyl, eller riven och fryst' },
      { slug: 'pumpa', name: 'Pumpa', emoji: '🎃', season: 'Oktober', ripeWhen: 'Skal hårt, stjälk torr och brun', storage: 'Svalt + torrt, 3–6 mån' },
      { slug: 'sockerart', name: 'Sockerärta', emoji: '🌱', season: 'Juni–augusti', ripeWhen: 'Skidor fyllda, ärtor små och söta', storage: 'Frys, eller ät direkt' },
      { slug: 'brytbona', name: 'Brytböna', emoji: '🌱', season: 'Juli–september', ripeWhen: 'Skidor fyllda, ärtor små inuti', storage: 'Frys efter blanca, eller pickla' },
    ],
  },
  {
    category: 'Bär och frukt',
    plants: [
      { slug: 'jordgubbe', name: 'Jordgubbe', emoji: '🍓', season: 'Juni–september', ripeWhen: 'Helt röd, glansig, lossnar lätt', storage: '1–2 dagar i kyl, eller sylt' },
      { slug: 'hallon', name: 'Hallon', emoji: '🍇', season: 'Juli (sommar) / aug–okt (höst)', ripeWhen: 'Lossnar med ett lätt drag', storage: '1–2 dagar i kyl, frys eller sylt' },
      { slug: 'blabar', name: 'Blåbär', emoji: '🫐', season: 'Juli–augusti', ripeWhen: 'Helt blå, faller av med tryck', storage: 'Frys direkt för bästa resultat' },
    ],
  },
];

export default function SkordetiderPage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Skördetider — när är dina grönsaker mogna?',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/skordetider`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Skördetider', item: `${SITE_URL}/skordetider` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Skördetider
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          När är dina grönsaker mogna? Här är de tydligaste tecknen på mognad för varje gröda du
          odlar i din pallkrage, plus hur du förvarar dem för längsta möjliga hållbarhet.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Allmänna regler</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Plocka regelbundet.</strong> En tomatplanta som har 30 mogna frukter slutar
          producera nya — den tror att den är klar. Plocka varje dag i högsäsong; det dubblar
          eller tredubblar totalskörden.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Skörda på morgonen.</strong> Bladväxter är fulla av vatten och knapprigast på
          morgonen. Tomater och paprika är dock sötare om de plockas på eftermiddagen.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Lämna inte för länge.</strong> Övermogna grönsaker blir trådiga, bittra eller
          ruttna. Tveka inte att plocka tidigt — bättre liten och söt än stor och seg.
        </p>

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Skördetider-tabell</h2>

        {TABLE.map((cat) => (
          <div key={cat.category} className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{cat.category}</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Växt</th>
                    <th className="px-4 py-3">Säsong</th>
                    <th className="px-4 py-3">Mognadstecken</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Förvaring</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cat.plants.map((p) => (
                    <tr key={p.slug}>
                      <td className="px-4 py-3">
                        <Link href={`/catalog/${p.slug}`} className="font-medium text-gray-900 hover:text-green-700">
                          {p.emoji} {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.season}</td>
                      <td className="px-4 py-3 text-gray-700">{p.ripeWhen}</td>
                      <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">{p.storage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <h2 className="mt-12 text-2xl font-bold text-gray-900">Förvaringsmetoder i korthet</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Källarförvaring i sand</strong> är guldstandarden för rotfrukter — morot,
          palsternacka, rödbeta, kålrot håller 4–6 månader vid 2–4 °C och fuktig luft.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Frysning</strong> bevarar smak och näring för bladväxter, bönor, ärtor, bär.
          Bladväxter ska blancheras (kort kokas) först. Bär fryses direkt.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Picklning</strong> är klassisk svensk metod för rödbeta, lök, gurka, paprika.
          Hållbart 6–12 månader i sval skafferi.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          <strong>Torkning</strong> för kryddor (oregano, timjan, dill, mynta) och chili.
          Hängtorka i skugga, smula sönder, förvara i mörk burk.
        </p>

        <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">Få skördevarning i mailen</h2>
          <p className="mt-1 text-sm text-green-800">
            Skapa en odling och få veckodigest på söndagar — vi påminner när dina växter är
            klara att skörda.
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

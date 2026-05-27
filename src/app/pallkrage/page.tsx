import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const PAGE_DESCRIPTION =
  'Komplett guide till pallkrage: mått, byggnation, jord, kvadratmetoden och varför pallkrage är det enklaste sättet att börja odla i Sverige.';

export const metadata: Metadata = {
  title: 'Pallkrage — så fungerar den och varför du vill ha en',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/pallkrage' },
  keywords: [
    'pallkrage', 'pallkrage mått', 'kvadratodling', 'square foot gardening',
    'odla i pallkrage', 'pallkrage byggnation', 'hur många plantor pallkrage',
  ],
  openGraph: {
    title: 'Pallkrage — guide till mått, jord och kvadratmetoden',
    description: 'Allt du behöver veta om pallkrage och kvadratodling på svenska.',
    url: `${SITE_URL}/pallkrage`,
    type: 'article',
  },
};

export default function PallkragePage() {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Pallkrage — så fungerar den och varför du vill ha en',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/pallkrage`,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Pallkrage', item: `${SITE_URL}/pallkrage` },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Guide</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Pallkrage — så fungerar den
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Pallkragen är Sveriges populäraste sätt att börja odla. Den är billig, snabb att sätta
          upp, och kombinerad med kvadratmetoden får du mer skörd per kvadratmeter än vid någon
          annan odlingsmetod. Här är allt du behöver veta.
        </p>
      </header>

      <section className="prose prose-green max-w-none">
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Vad är en pallkrage?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En pallkrage är en stadig träram — en "ram" som passar ovanpå en EUR-pall — som du
          fyller med jord och odlar grönsaker i. Standardmåttet är{' '}
          <strong>120 × 80 cm</strong>, höjd 20 cm. Två kragar staplade ovanpå varandra ger en
          djupare bädd, vilket är att rekommendera för rotfrukter som morötter och palsternacka.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Pallkragen är billig (200–350 kr begagnad, 500–700 ny), tål svenska vintrar, och du
          slipper böja dig hela tiden — höjden gör odlingen rygg-vänlig. Den passar lika bra på
          asfalt (lägg geotextil under), på gräsmatta eller direkt på jordytan.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Mått och kapacitet</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          En standardpallkrage 120 × 80 cm rymmer enligt kvadratmetoden{' '}
          <strong>12 odlingsrutor</strong> à 30 × 30 cm. Två pallkragar staplade ger 40 cm djup —
          ideellt för rotfrukter. Tre kragar staplade ger 60 cm och fungerar för i princip alla
          växter inklusive potatis och stora växter som zucchini.
        </p>
        <ul className="mt-4 space-y-2 text-gray-700">
          <li><strong>1 pallkrage</strong> (20 cm djup): 12 rutor — sallat, kryddor, lök, kålväxter, lågt växande</li>
          <li><strong>2 pallkragar</strong> (40 cm djup): 12 rutor — alla ovan + morot, rödbeta, palsternacka, tomater</li>
          <li><strong>3 pallkragar</strong> (60 cm djup): 12 rutor — alla ovan + potatis, jordärtskocka, fruktbuskar</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Kvadratmetoden</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Kvadratmetoden ("square foot gardening") är en amerikansk odlingsfilosofi som passar
          pallkragen perfekt. Varje 30 × 30 cm-ruta planteras med ett bestämt antal växter baserat
          på hur stora de blir:
        </p>
        <ul className="mt-4 space-y-2 text-gray-700">
          <li><strong>1 stor planta per ruta:</strong> tomat, paprika, chili, zucchini (faktiskt 4 rutor), grönkål</li>
          <li><strong>4 mellanstora per ruta:</strong> sallat, basilika, mangold, oregano, persilja</li>
          <li><strong>9 mindre per ruta:</strong> spenat, rödbeta, koriander, vitlök, palsternacka</li>
          <li><strong>16 små per ruta:</strong> morot, rädisa, gräslök, salladslök</li>
        </ul>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Resultatet: en standardpallkrage med 12 rutor kan rymma{' '}
          <strong>över 100 plantor</strong> på 0,96 m². I traditionell radodling skulle samma yta
          ge 15–20 plantor.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Jord — det viktigaste</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Pallkragens framgång beror till 80 % på jorden. Klassisk SFG-rekommendation är "Mel's
          Mix": en tredjedel kompost, en tredjedel torv (eller kokosfiber) och en tredjedel
          vermikulit. För svenska förhållanden funkar även en blandning av planteringsjord,
          mogen kompost och lite kreafer + naturgödsel.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Räkna med <strong>cirka 100 liter jord per pallkrage</strong> (20 cm djup). Köp gärna
          säckar färdig planteringsjord från trädgårdsbutiken — billigt och slipper transportera
          en hel bilfull. Toppdressa varje vår med 5 cm kompost; det räcker som löpande näring.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Var ska pallkragen stå?</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Sol är A och O — minst <strong>6 timmar direkt sol per dag</strong> för grönsaksväxter.
          Söder- eller västläge är ideal. Tomater, paprika och chili kräver de varmaste hörnen.
          Sallat, spenat och rucola tål halvskugga och kan placeras i svalare lägen.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Ställ inte pallkragen i tjockt gräs utan att lägga något under — gräset växer in i
          jorden och konkurrerar om näringen. Geotextil eller wellpapp i botten håller bort gräs
          de första två åren tills rötterna nått ner i marken under.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-gray-900">Kom igång på 5 minuter</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-700">
          <li>
            <Link href="/gardens/new" className="text-green-700 underline">Skapa en odling</Link>{' '}
            med dina mått och välj din odlingszon
          </li>
          <li>Få automatiskt förslag på antal pallkragar och hur de passar i din yta</li>
          <li>Använd <Link href="/catalog" className="text-green-700 underline">växtkatalogen</Link> eller en preset (Pizzaträdgård, Salladsblandning…)</li>
          <li>Få ditt personliga odlingsschema med försådd, utplantering och skördetider</li>
        </ol>

        <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-900">Klar att börja?</h3>
          <p className="mt-1 text-sm text-green-800">
            Det tar 2 minuter att skapa en odling och få ditt skräddarsydda såschema.
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

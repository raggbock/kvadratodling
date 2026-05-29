import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SWEDISH_ZONES, lastFrostDateForYear } from '@/lib/zones';
import { computeSchedule, type ScheduleEvent, KIND_STYLES, type ScheduleEventKind } from '@/lib/plantSchedule';

// Cache aggressively — this is fully derived from zone data and the plant
// catalog. Re-render once a day so a newly-added plant appears within 24h.
export const revalidate = 86400;

const KIND_LABELS: Record<ScheduleEventKind, string> = {
  sow_indoors: 'Så inomhus',
  direct_sow: 'Så utomhus',
  transplant: 'Plantera ut',
  plant_autumn: 'Sätt på hösten',
  harvest_start: 'Börja skörda',
  harvest_end: 'Sista skörd',
};

const MONTH_SV = [
  'januari','februari','mars','april','maj','juni',
  'juli','augusti','september','oktober','november','december',
];

interface Props {
  params: Promise<{ zon: string }>;
}

function findZone(slug: string) {
  return SWEDISH_ZONES.find((z) => z.id.toLowerCase() === slug.toLowerCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zon } = await params;
  const z = findZone(zon);
  if (!z) return {};
  const desc = `Komplett odlingsschema för ${z.nameSv} (${z.id}) — sista frost runt ${z.lastFrostMD.split('-').reverse().join('/')}. När du ska så inomhus, plantera ut och skörda 108 grönsaker och kryddor.`;
  return {
    title: `Odlingsschema ${z.id} — ${z.nameSv}`,
    description: desc,
    alternates: { canonical: `/odlingsschema/${z.id.toLowerCase()}` },
    keywords: [
      `odlingsschema ${z.id.toLowerCase()}`,
      `när så ${z.cities[0].toLowerCase()}`,
      `växtzon ${z.id.toLowerCase()}`,
      ...z.cities.map((c) => `odla ${c.toLowerCase()}`),
    ],
    openGraph: {
      title: `Odlingsschema ${z.id} — ${z.nameSv}`,
      description: desc,
      url: `${SITE_URL}/odlingsschema/${z.id.toLowerCase()}`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return SWEDISH_ZONES.map((z) => ({ zon: z.id.toLowerCase() }));
}

export default async function OdlingsschemaZonPage({ params }: Props) {
  const { zon } = await params;
  const zone = findZone(zon);
  if (!zone) notFound();

  const supabase = await createClient();
  const { data: plants } = await supabase
    .from('plants')
    .select('id, slug, common_name, emoji, sow_indoors_days_before_frost, direct_sow_days_before_frost, transplant_days_after_frost, days_to_maturity_min, days_to_maturity_max')
    .eq('is_active', true)
    .order('common_name');

  const plantInputs = (plants ?? []).map((p) => ({
    id: p.slug,
    commonName: p.common_name,
    emoji: p.emoji,
    sowIndoorsDaysBeforeFrost: p.sow_indoors_days_before_frost,
    directSowDaysBeforeFrost: p.direct_sow_days_before_frost,
    transplantDaysAfterFrost: p.transplant_days_after_frost,
    daysToMaturityMin: p.days_to_maturity_min,
    daysToMaturityMax: p.days_to_maturity_max,
  }));

  const referenceYear = new Date().getFullYear();
  const frostDate = lastFrostDateForYear(zone.lastFrostMD, referenceYear);
  const events = computeSchedule(frostDate, plantInputs);

  // Group by month-of-year (independent of year so future/past flows together)
  const byMonth = new Map<number, ScheduleEvent[]>();
  for (const e of events) {
    const m = e.date.getMonth();
    const arr = byMonth.get(m) ?? [];
    arr.push(e);
    byMonth.set(m, arr);
  }

  const pageDesc = `Komplett odlingsschema för ${zone.nameSv} (${zone.id}). Sista frost cirka ${zone.lastFrostMD.split('-').reverse().join('/')}.`;
  const url = `${SITE_URL}/odlingsschema/${zone.id.toLowerCase()}`;
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Odlingsschema ${zone.id} — ${zone.nameSv}`,
    description: pageDesc,
    url,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Odlingsschema', item: `${SITE_URL}/odlingsschema` },
      { '@type': 'ListItem', position: 3, name: `${zone.id} — ${zone.nameSv}`, item: url },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={[article, breadcrumb]} />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
          Odlingsschema
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {zone.id} — {zone.nameSv}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">{zone.description}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-400">Sista frost</dt>
            <dd className="mt-0.5 font-semibold text-gray-900">
              ~{zone.lastFrostMD.split('-')[2]} {MONTH_SV[Number(zone.lastFrostMD.split('-')[1]) - 1]}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-400">Frostfria dagar</dt>
            <dd className="mt-0.5 font-semibold text-gray-900">{zone.frostFreeDays}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs uppercase tracking-wider text-gray-400">Städer</dt>
            <dd className="mt-0.5 text-gray-700">{zone.cities.slice(0, 3).join(', ')}</dd>
          </div>
        </dl>
      </header>

      {/* Month-nav anchor links */}
      <nav className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-gray-100 bg-white p-3">
        {MONTH_SV.map((m, i) => {
          const has = byMonth.has(i);
          return (
            <a
              key={m}
              href={has ? `#${m}` : undefined}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                has
                  ? 'bg-green-50 text-green-800 hover:bg-green-100'
                  : 'text-gray-300 cursor-default'
              }`}
            >
              {m.slice(0, 3)}
            </a>
          );
        })}
      </nav>

      {/* Legend */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.keys(KIND_LABELS) as ScheduleEventKind[]).map((kind) => (
          <span
            key={kind}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${KIND_STYLES[kind].bg} ${KIND_STYLES[kind].text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${KIND_STYLES[kind].dot}`} />
            {KIND_LABELS[kind]}
          </span>
        ))}
      </div>

      {/* Month sections */}
      <div className="space-y-10">
        {MONTH_SV.map((m, i) => {
          const monthEvents = byMonth.get(i);
          if (!monthEvents) return null;
          monthEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
          return (
            <section key={m} id={m}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {m.charAt(0).toUpperCase() + m.slice(1)} — {monthEvents.length} händelser
              </h2>
              <div className="space-y-2">
                {monthEvents.map((event, j) => {
                  const styles = KIND_STYLES[event.kind];
                  return (
                    <div
                      key={`${event.plantId}-${event.kind}-${j}`}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${styles.bg}`}
                    >
                      <span className="text-lg">{event.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
                          {KIND_LABELS[event.kind]}
                        </span>
                        <span className={`ml-2 text-sm ${styles.text}`}>
                          <Link href={`/catalog/${event.plantId}`} className="hover:underline">
                            {event.plantName}
                          </Link>
                        </span>
                      </div>
                      <time className={`shrink-0 text-sm tabular-nums ${styles.text} opacity-75`}>
                        {event.date.getDate()} {m.slice(0, 3)}
                      </time>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">Vill du ha det här på din pallkrage?</h2>
        <p className="mt-1 text-sm text-green-800">
          Skapa en gratis odling så filtreras schemat ner till de växter du faktiskt planterat.
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

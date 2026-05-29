import { Suspense } from 'react';
import Link from 'next/link';
import { FrostDatePicker } from './FrostDatePicker';
import {
  ScheduleEvent,
  KIND_STYLES,
  ScheduleEventKind,
} from '@/lib/plantSchedule';

const KIND_LABELS: Record<ScheduleEventKind, string> = {
  sow_indoors: 'Så inomhus',
  direct_sow: 'Så utomhus',
  transplant: 'Plantera ut',
  plant_autumn: 'Sätt på hösten',
  harvest_start: 'Börja skörda',
  harvest_end: 'Sista skörd',
};

interface ScheduleViewProps {
  gardenId: string;
  gardenName: string;
  frostDateIso: string;
  events: ScheduleEvent[];
  /** True when the listed plants come from actual planted slots, false for full-catalog fallback */
  plantsAreFromBed: boolean;
  /** True when the user explicitly asked for catalog view via ?mode=catalog even though plants exist */
  catalogModeForced: boolean;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

function formatRelative(date: Date, today: Date): string {
  const days = Math.round((startOfDay(date).getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return 'idag';
  if (days === 1) return 'imorgon';
  if (days < 7) return `om ${days} dagar`;
  if (days < 30) return `om ${Math.round(days / 7)} v`;
  return `om ${Math.round(days / 30)} mån`;
}

function ScheduleEventRow({ event, today }: { event: ScheduleEvent; today: Date }) {
  const styles = KIND_STYLES[event.kind];
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${styles.bg}`}>
      <span className="text-lg" role="img" aria-label={event.plantName}>
        {event.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
            {KIND_LABELS[event.kind]}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-sm ${styles.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {event.plantName}
          </span>
        </div>
      </div>
      <time
        className={`shrink-0 text-right text-sm tabular-nums ${styles.text} opacity-75`}
        dateTime={event.date.toISOString()}
      >
        <div>{formatDate(event.date)}</div>
        <div className="text-xs opacity-80">{formatRelative(event.date, today)}</div>
      </time>
    </div>
  );
}

function groupByMonth(events: ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const m = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const key = e.date.toLocaleString('sv-SE', { year: 'numeric', month: 'long' });
    const arr = m.get(key) ?? [];
    arr.push(e);
    m.set(key, arr);
  }
  return m;
}

export function ScheduleView({
  gardenId,
  gardenName,
  frostDateIso,
  events,
  plantsAreFromBed,
  catalogModeForced,
}: ScheduleViewProps) {
  const today = startOfDay(new Date());
  const weekCutoff = addDays(today, 7);

  const thisWeek = events.filter((e) => e.date < weekCutoff);
  const later = events.filter((e) => e.date >= weekCutoff);
  const laterGrouped = groupByMonth(later);

  // Find the next sow-indoors so we can highlight "your next försådd" even
  // when it's a few weeks away — that's the main planning question in spring.
  const nextSowIndoors = later.find((e) => e.kind === 'sow_indoors');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {gardenId !== 'demo' && (
                <Link href={`/gardens/${gardenId}`} className="text-sm text-gray-500 hover:text-green-700">
                  ← {gardenName}
                </Link>
              )}
              <h1 className="text-xl font-semibold text-gray-900">Odlingsschema — nästa 12 månader</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {plantsAreFromBed
                  ? 'Baserat på växterna du planterat'
                  : 'Baserat på alla växter i katalogen — välj och plantera så filtreras schemat ner'}
              </p>
            </div>
            <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />}>
              <FrostDatePicker value={frostDateIso} />
            </Suspense>
          </div>

          {!plantsAreFromBed && gardenId !== 'demo' && !catalogModeForced && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              💡 Din odling är tom — schemat visar alla växter i katalogen. Lägg till en{' '}
              <Link href={`/gardens/${gardenId}`} className="underline hover:no-underline">
                odlingslåda
              </Link>{' '}
              och plantera bara de växter du vill ha, så blir schemat skräddarsytt.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
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
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-8 py-16 text-center">
            <p className="text-gray-500">Inga händelser i schemat för de närmaste 12 månaderna.</p>
            <p className="mt-1 text-sm text-gray-400">
              Kontrollera att sista frostdatumet är satt korrekt.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* This week — biggest visual weight, that's "vad kan jag göra idag" */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-700">
                Att göra idag och denna vecka
              </h2>
              {thisWeek.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
                  Inget brådskar just nu.
                  {nextSowIndoors && (
                    <>
                      {' '}Nästa försådd: <strong className="text-violet-700">{nextSowIndoors.plantName}</strong>{' '}
                      ({formatDate(nextSowIndoors.date)}, {formatRelative(nextSowIndoors.date, today)}).
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {thisWeek.map((event, i) => (
                    <ScheduleEventRow key={`${event.plantId}-${event.kind}-${i}`} event={event} today={today} />
                  ))}
                </div>
              )}
            </section>

            {/* Rest of the year, grouped by month */}
            {laterGrouped.size > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Senare i året
                </h2>
                <div className="space-y-6">
                  {Array.from(laterGrouped.entries()).map(([month, monthEvents]) => (
                    <div key={month}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {month}
                      </h3>
                      <div className="space-y-2">
                        {monthEvents.map((event, i) => (
                          <ScheduleEventRow
                            key={`${event.plantId}-${event.kind}-${month}-${i}`}
                            event={event}
                            today={today}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

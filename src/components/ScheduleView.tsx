import { Suspense } from "react";
import { FrostDatePicker } from "./FrostDatePicker";
import {
  ScheduleEvent,
  groupEventsByMonth,
  KIND_STYLES,
  ScheduleEventKind,
} from "@/lib/plantSchedule";

const KIND_LABELS: Record<ScheduleEventKind, string> = {
  sow_indoors: "Så inomhus",
  direct_sow: "Så utomhus",
  transplant: "Plantera ut",
  harvest_start: "Börja skörda",
  harvest_end: "Sista skörd",
};

interface ScheduleViewProps {
  gardenName: string;
  frostDateIso: string; // "YYYY-MM-DD"
  events: ScheduleEvent[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
  });
}

function ScheduleEventRow({ event }: { event: ScheduleEvent }) {
  const styles = KIND_STYLES[event.kind];
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${styles.bg}`}>
      <span className="text-lg" role="img" aria-label={event.plantName}>
        {event.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
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
        className={`shrink-0 text-sm tabular-nums ${styles.text} opacity-75`}
        dateTime={event.date.toISOString()}
      >
        {formatDate(event.date)}
      </time>
    </div>
  );
}

export function ScheduleView({ gardenName, frostDateIso, events }: ScheduleViewProps) {
  const grouped = groupEventsByMonth(events);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Odlingsschema
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">{gardenName}</p>
            </div>
            <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />}>
              <FrostDatePicker value={frostDateIso} />
            </Suspense>
          </div>

          {/* Legend */}
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

      {/* Timeline */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-8 py-16 text-center">
            <p className="text-gray-500">
              Inga växter har placerats i trädgården ännu.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Lägg till växter i din trädgårdsplan för att se schemat.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([month, monthEvents]) => (
              <section key={month}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
                  {month}
                </h2>
                <div className="space-y-2">
                  {monthEvents.map((event, i) => (
                    <ScheduleEventRow key={`${event.plantId}-${event.kind}-${i}`} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

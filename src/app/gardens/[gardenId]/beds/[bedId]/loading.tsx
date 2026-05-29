export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="h-7 w-40 animate-pulse rounded bg-surface-subtle" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-surface-subtle" />
      <div
        className="mt-6 inline-grid gap-1 rounded-lg border border-border-default bg-surface-subtle p-2"
        style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-12 w-12 animate-pulse rounded bg-surface-inset sm:h-14 sm:w-14" />
        ))}
      </div>
    </div>
  );
}

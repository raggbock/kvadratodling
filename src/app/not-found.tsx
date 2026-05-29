import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl" aria-hidden>
        🌱
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-text-default">Sidan hittades inte</h1>
      <p className="mt-2 text-sm text-text-subtle">
        Den här sidan finns inte — kanske växte den bort. Hitta tillbaka nedan.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-brand-default px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-emphasis"
        >
          Till startsidan
        </Link>
        <Link
          href="/catalog"
          className="rounded-md border border-border-default bg-surface-default px-5 py-2.5 text-sm font-medium text-text-default hover:bg-surface-subtle"
        >
          Bläddra bland växter
        </Link>
      </div>
    </div>
  );
}

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

// Route-level error boundary inside the root layout — keeps the header/footer
// shell intact instead of bubbling every throw up to the full-page global-error.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl" aria-hidden>
        🌧️
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-text-default">Något gick fel</h1>
      <p className="mt-2 text-sm text-text-subtle">
        Vi kunde inte ladda sidan just nu. Felet har rapporterats — försök igen.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-brand-default px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-emphasis"
        >
          Försök igen
        </button>
        <Link
          href="/"
          className="rounded-md border border-border-default bg-surface-default px-5 py-2.5 text-sm font-medium text-text-default hover:bg-surface-subtle"
        >
          Till startsidan
        </Link>
      </div>
    </div>
  );
}

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import './globals.css';

// global-error replaces the root layout entirely, so it ships its own
// <html>/<body> and imports globals.css to get the design tokens.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sv">
      <body className="flex min-h-screen flex-col items-center justify-center bg-surface-page p-8 text-center text-text-default">
        <div className="text-5xl" aria-hidden>
          🌧️
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Något gick fel</h1>
        <p className="mt-2 max-w-sm text-sm text-text-subtle">
          Ett oväntat fel uppstod och har rapporterats. Försök igen om en stund.
        </p>
        <button
          onClick={unstable_retry}
          className="mt-6 rounded-md bg-brand-default px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-emphasis"
        >
          Försök igen
        </button>
      </body>
    </html>
  );
}

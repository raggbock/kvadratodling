'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">The error has been reported. Please try again.</p>
        <button
          onClick={unstable_retry}
          className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

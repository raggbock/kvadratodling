'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const errorMessages: Record<string, string> = {
  auth_failed: 'Inloggningslänken har gått ut eller är redan använd. Begär en ny nedan.',
  wrong_browser:
    'Öppna länken i samma webbläsare där du begärde den, och försök igen.',
  no_code: 'Inloggningslänken var ogiltig. Begär en ny nedan.',
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-3 text-4xl">📬</div>
          <p className="text-lg font-semibold text-gray-900">Kolla din e-post</p>
          <p className="mt-2 text-sm text-gray-500">
            Vi har skickat en magisk länk till <span className="font-medium">{email}</span>.
            Öppna den i den här webbläsaren.
          </p>
        </div>
      </div>
    );
  }

  const bannerMessage = urlError ? (errorMessages[urlError] ?? errorMessages.auth_failed) : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Logga in</h1>
        {bannerMessage && (
          <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {bannerMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.se"
            required
            autoFocus
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Skickar…' : 'Skicka magisk länk'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Ny här?{' '}
          <Link href="/auth/signup" className="font-medium text-green-700 hover:underline">
            Skapa ett konto
          </Link>
        </p>
      </div>
    </div>
  );
}

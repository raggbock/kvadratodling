'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const errorMessages: Record<string, string> = {
  auth_failed: 'Inloggningslänken har gått ut eller är redan använd. Begär en ny nedan.',
  wrong_browser: 'Öppna länken i samma webbläsare där du begärde den, och försök igen.',
  no_code: 'Bekräftelselänken var ogiltig. Försök igen.',
  reset_required: 'Logga in för att fortsätta.',
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const nextPath = searchParams.get('next') ?? '/gardens';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      // Supabase returns "Invalid login credentials" for both unknown email
      // and wrong password — keep it that way so we don't enumerate accounts.
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Fel e-post eller lösenord.'
          : authError.message,
      );
      setLoading(false);
      return;
    }
    router.push(nextPath);
    router.refresh();
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
            autoComplete="email"
            required
            autoFocus
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-gray-500 hover:text-green-700 hover:underline"
          >
            Glömt lösenord?
          </Link>
        </div>
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

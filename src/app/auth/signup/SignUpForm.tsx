'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function SignUpForm() {
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
            Klicka på den för att aktivera ditt konto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Skapa konto</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Ange din e-post så skickar vi en magisk länk för att komma igång.
        </p>
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
          Har du redan ett konto?{' '}
          <Link href="/auth/login" className="font-medium text-green-700 hover:underline">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}

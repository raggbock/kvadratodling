import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Handles both Supabase email-link flows:
//   PKCE       — link arrives with `?code=...`,           exchanged via exchangeCodeForSession
//   token_hash — link arrives with `?token_hash=&type=…`, verified via verifyOtp
// Which one the email contains depends on the email template; supporting both
// keeps the callback resilient to template variations.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/gardens';

  if (!code && !tokenHash) {
    console.error('[auth/callback] No code or token_hash in callback URL. Params:', Object.fromEntries(searchParams));
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type ?? 'magiclink', token_hash: tokenHash! });

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.error('[auth/callback] session exchange failed:', error.message, error.status);
  // pkce_verifier_missing = opened link in different browser/device than where sign-in was initiated
  const errorCode = error.message?.toLowerCase().includes('verif') ? 'wrong_browser' : 'auth_failed';
  return NextResponse.redirect(`${origin}/auth/login?error=${errorCode}`);
}

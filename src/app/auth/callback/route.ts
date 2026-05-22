import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/gardens';

  if (!code) {
    console.error('[auth/callback] No code in callback URL. Params:', Object.fromEntries(searchParams));
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.error('[auth/callback] exchangeCodeForSession failed:', error.message, error.status);
  // pkce_verifier_missing = opened link in different browser/device than where sign-in was initiated
  const errorCode = error.message?.toLowerCase().includes('verif') ? 'wrong_browser' : 'auth_failed';
  return NextResponse.redirect(`${origin}/auth/login?error=${errorCode}`);
}

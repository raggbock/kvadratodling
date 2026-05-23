// Temporary diagnostic endpoint — DELETE after auth-403 issue is resolved.
// Exposes details about the server-side Supabase session and an RLS probe.
// Only returns data to a logged-in session (otherwise 401 to anonymous probers).
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((c) => c.name);

  const supabase = await createClient();

  const userResult = await supabase.auth.getUser();
  const sessionResult = await supabase.auth.getSession();

  if (!userResult.data.user) {
    return NextResponse.json(
      {
        stage: 'getUser',
        userError: userResult.error?.message ?? null,
        cookieNames,
      },
      { status: 401 },
    );
  }

  const gardensResult = await supabase.from('gardens').select('id, name').limit(5);
  const usersUpsertResult = await supabase
    .from('users')
    .upsert(
      {
        id: userResult.data.user.id,
        email: userResult.data.user.email!,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select();

  return NextResponse.json({
    cookieNames,
    user: { id: userResult.data.user.id, email: userResult.data.user.email },
    hasSession: !!sessionResult.data.session,
    accessTokenPrefix: sessionResult.data.session?.access_token?.slice(0, 24) ?? null,
    gardens: {
      ok: !gardensResult.error,
      error: gardensResult.error ? {
        message: gardensResult.error.message,
        code: gardensResult.error.code,
        details: gardensResult.error.details,
        hint: gardensResult.error.hint,
      } : null,
      rowCount: gardensResult.data?.length ?? null,
    },
    usersUpsert: {
      ok: !usersUpsertResult.error,
      error: usersUpsertResult.error ? {
        message: usersUpsertResult.error.message,
        code: usersUpsertResult.error.code,
        details: usersUpsertResult.error.details,
        hint: usersUpsertResult.error.hint,
      } : null,
    },
  });
}

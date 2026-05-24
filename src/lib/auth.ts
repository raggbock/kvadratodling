import { createClient } from '@/utils/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error('Unauthorized');

  const { error: upsertErr } = await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email!,
      name: (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | null ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  // Surface upsert failures (RLS / GRANT regression, schema drift) instead of
  // silently passing the user through.
  if (upsertErr) throw new Error(`users upsert failed: ${upsertErr.message}`);

  return { id: user.id, email: user.email! };
}

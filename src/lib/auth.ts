import { createClient } from '@/utils/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error('Unauthorized');

  await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email!,
      name: (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | null ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  return { id: user.id, email: user.email! };
}

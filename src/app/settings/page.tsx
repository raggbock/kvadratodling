import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SettingsForm } from './SettingsForm';

export const metadata = { title: 'Inställningar | Kvadratodling' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/settings');

  const { data: row } = await supabase
    .from('users')
    .select('weekly_digest_enabled, weekly_digest_last_sent_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inställningar</h1>
      <SettingsForm
        email={user.email ?? ''}
        digestEnabled={row?.weekly_digest_enabled ?? true}
        lastSentAt={row?.weekly_digest_last_sent_at ?? null}
      />
    </div>
  );
}

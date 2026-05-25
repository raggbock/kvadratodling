import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Välj nytt lösenord | Kvadratodling',
};

// Recovery session is set by /auth/callback before we land here.
// If someone hits this page directly without a session, bounce them to login.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?error=reset_required');
  return <ResetPasswordForm />;
}

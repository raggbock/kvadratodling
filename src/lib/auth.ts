import { createClient } from '@/utils/supabase/server';
import { prisma } from './prisma';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error('Unauthorized');

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: {
      id: user.id,
      email: user.email!,
      name: (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | null ?? null,
    },
  });

  return dbUser;
}

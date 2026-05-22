import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { EditGardenClient } from './EditGardenClient';

export default async function EditGardenPage({
  params,
}: {
  params: Promise<{ gardenId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { gardenId } = await params;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect('/gardens');

  const garden = await prisma.garden.findFirst({
    where: { id: gardenId, userId: dbUser.id },
  });
  if (!garden) notFound();

  return <EditGardenClient garden={garden} />;
}

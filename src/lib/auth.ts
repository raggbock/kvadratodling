import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@placeholder.local`,
    },
  });

  return user;
}

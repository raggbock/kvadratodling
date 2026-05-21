import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const user = await requireUser();
    const { gardenId } = await params;
    const garden = await prisma.garden.findFirst({
      where: { id: gardenId, userId: user.id },
      include: {
        beds: {
          orderBy: { createdAt: 'asc' },
          include: {
            plantingSlots: {
              include: { plant: true },
            },
          },
        },
      },
    });
    if (!garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(garden);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const user = await requireUser();
    const { gardenId } = await params;
    await prisma.garden.deleteMany({ where: { id: gardenId, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

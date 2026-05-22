import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateGardenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  lastFrostDate: z.string().nullable().optional().transform((v) =>
    v === null ? null : v ? new Date(v) : undefined
  ),
  widthCm: z.number().int().min(1).max(10000).nullable().optional(),
  lengthCm: z.number().int().min(1).max(10000).nullable().optional(),
});

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const user = await requireUser();
    const { gardenId } = await params;

    const existing = await prisma.garden.findFirst({ where: { id: gardenId, userId: user.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = UpdateGardenSchema.parse(await req.json());
    const garden = await prisma.garden.update({
      where: { id: gardenId },
      data: body,
    });
    return NextResponse.json(garden);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
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

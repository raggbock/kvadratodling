import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpsertSlotSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  plantSlug: z.string().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    const user = await requireUser();
    const { bedId } = await params;

    const bed = await prisma.bed.findFirst({
      where: { id: bedId, garden: { userId: user.id } },
    });
    if (!bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { row, col, plantSlug } = UpsertSlotSchema.parse(await req.json());

    if (plantSlug === null) {
      await prisma.plantingSlot.deleteMany({ where: { bedId, row, col } });
      return NextResponse.json({ deleted: true });
    }

    const plant = await prisma.plant.findUnique({ where: { slug: plantSlug } });
    if (!plant) return NextResponse.json({ error: 'Unknown plant' }, { status: 400 });

    const slot = await prisma.plantingSlot.upsert({
      where: { bedId_row_col: { bedId, row, col } },
      create: { bedId, row, col, plantId: plant.id },
      update: { plantId: plant.id },
      include: { plant: true },
    });
    return NextResponse.json(slot);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateBedSchema = z.object({
  name: z.string().min(1).max(100),
  rows: z.number().int().min(1).max(20),
  cols: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    const user = await requireUser();
    const { gardenId } = await params;

    const garden = await prisma.garden.findFirst({ where: { id: gardenId, userId: user.id } });
    if (!garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = CreateBedSchema.parse(await req.json());
    const bed = await prisma.bed.create({ data: { gardenId, ...body } });
    return NextResponse.json(bed, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

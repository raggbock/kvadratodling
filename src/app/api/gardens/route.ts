import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateGardenSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  lastFrostDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  widthCm: z.number().int().min(1).max(10000).optional(),
  lengthCm: z.number().int().min(1).max(10000).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const gardens = await prisma.garden.findMany({
      where: { userId: user.id },
      include: { beds: { select: { id: true, name: true, rows: true, cols: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(gardens);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = CreateGardenSchema.parse(await req.json());
    const garden = await prisma.garden.create({
      data: { userId: user.id, ...body },
    });
    return NextResponse.json(garden, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

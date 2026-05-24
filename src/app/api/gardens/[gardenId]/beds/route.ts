import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const CreateBedSchema = z.object({
  name: z.string().min(1).max(100),
  rows: z.number().int().min(1).max(20),
  cols: z.number().int().min(1).max(20),
  // Real-world bed dimensions in cm. Optional for backwards compat — old
  // callers that only send rows/cols still work and the server derives cm.
  widthCm: z.number().int().min(30).max(2000).optional(),
  lengthCm: z.number().int().min(30).max(2000).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    await requireUser();
    const supabase = await createClient();
    const { gardenId } = await params;

    // RLS ensures user owns the garden; returns null if not found or not owned
    const { data: garden } = await supabase.from('gardens').select('id').eq('id', gardenId).single();
    if (!garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = CreateBedSchema.parse(await req.json());
    const { data: bed, error } = await supabase
      .from('beds')
      .insert({
        garden_id: gardenId,
        name: body.name,
        rows: body.rows,
        cols: body.cols,
        notes: body.notes ?? null,
        width_cm: body.widthCm ?? body.cols * 30,
        length_cm: body.lengthCm ?? body.rows * 30,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(bed, { status: 201 });
  } catch (err) {
    return apiError(err, 'api/gardens/[id]/beds POST');
  }
}

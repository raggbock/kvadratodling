import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
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
    await requireUser();
    const supabase = await createClient();
    const { gardenId } = await params;

    // RLS ensures user owns the garden; returns null if not found or not owned
    const { data: garden } = await supabase.from('gardens').select('id').eq('id', gardenId).single();
    if (!garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = CreateBedSchema.parse(await req.json());
    const { data: bed, error } = await supabase
      .from('beds')
      .insert({ garden_id: gardenId, ...body })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(bed, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

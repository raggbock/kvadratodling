import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
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
    await requireUser();
    const supabase = await createClient();
    const { bedId } = await params;

    // RLS ensures user owns the bed (via garden ownership)
    const { data: bed } = await supabase.from('beds').select('id').eq('id', bedId).single();
    if (!bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { row, col, plantSlug } = UpsertSlotSchema.parse(await req.json());

    if (plantSlug === null) {
      await supabase.from('planting_slots').delete().match({ bed_id: bedId, row, col });
      return NextResponse.json({ deleted: true });
    }

    const { data: plant } = await supabase.from('plants').select('id').eq('slug', plantSlug).single();
    if (!plant) return NextResponse.json({ error: 'Unknown plant' }, { status: 400 });

    const { data: slot, error } = await supabase
      .from('planting_slots')
      .upsert(
        { bed_id: bedId, row, col, plant_id: plant.id, updated_at: new Date().toISOString() },
        { onConflict: 'bed_id,row,col' }
      )
      .select('*, plant:plants(*)')
      .single();
    if (error) throw error;
    return NextResponse.json(slot);
  } catch (err) {
    return apiError(err, 'api/beds/[id]/slots PUT');
  }
}

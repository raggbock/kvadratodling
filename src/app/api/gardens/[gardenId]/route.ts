import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import type { TablesUpdate } from '@/utils/supabase/database.types';
import { z } from 'zod';

const UpdateGardenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  lastFrostDate: z.string().nullable().optional(),
  widthCm: z.number().int().min(1).max(10000).nullable().optional(),
  lengthCm: z.number().int().min(1).max(10000).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
) {
  try {
    await requireUser();
    const supabase = await createClient();
    const { gardenId } = await params;
    const { data: garden, error } = await supabase
      .from('gardens')
      .select('*, beds(*, planting_slots(*, plant:plants(*)))')
      .eq('id', gardenId)
      .single();
    if (error || !garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    await requireUser();
    const supabase = await createClient();
    const { gardenId } = await params;
    const body = UpdateGardenSchema.parse(await req.json());

    const updates: TablesUpdate<'gardens'> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.location !== undefined) updates.location = body.location;
    if (body.lastFrostDate !== undefined) updates.last_frost_date = body.lastFrostDate;
    if (body.widthCm !== undefined) updates.width_cm = body.widthCm;
    if (body.lengthCm !== undefined) updates.length_cm = body.lengthCm;

    const { data: garden, error } = await supabase
      .from('gardens')
      .update(updates)
      .eq('id', gardenId)
      .select()
      .single();
    if (error || !garden) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    await requireUser();
    const supabase = await createClient();
    const { gardenId } = await params;
    await supabase.from('gardens').delete().eq('id', gardenId);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

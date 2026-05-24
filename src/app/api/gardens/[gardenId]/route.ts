import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
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
  } catch (err) {
    return apiError(err, 'api/gardens/[id] GET');
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
    return apiError(err, 'api/gardens/[id] PATCH');
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
    // RLS silently filters rows the user can't touch — verify a row was
    // actually deleted, otherwise 204 lies to the client.
    const { data, error } = await supabase
      .from('gardens')
      .delete()
      .eq('id', gardenId)
      .select('id');
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return apiError(err, 'api/gardens/[id] DELETE');
  }
}

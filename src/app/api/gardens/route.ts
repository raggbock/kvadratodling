import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const CreateGardenSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  lastFrostDate: z.string().optional().transform((v) => (v ? v : undefined)),
  widthCm: z.number().int().min(1).max(10000).optional(),
  lengthCm: z.number().int().min(1).max(10000).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('*, beds(id, name, rows, cols)')
      .eq('user_id', user.id)               // belt-and-suspenders alongside RLS
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(gardens);
  } catch (err) {
    return apiError(err, 'api/gardens GET');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const body = CreateGardenSchema.parse(await req.json());
    const { data: garden, error } = await supabase
      .from('gardens')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description ?? null,
        location: body.location ?? null,
        last_frost_date: body.lastFrostDate ?? null,
        width_cm: body.widthCm ?? null,
        length_cm: body.lengthCm ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(garden, { status: 201 });
  } catch (err) {
    return apiError(err, 'api/gardens POST');
  }
}

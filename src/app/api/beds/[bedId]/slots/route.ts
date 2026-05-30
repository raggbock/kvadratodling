import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ChangeSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  plantSlug: z.string().nullable(),
});
const BodySchema = z.object({ changes: z.array(ChangeSchema).min(1).max(400) });

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bedId: string }> }
) {
  try {
    await requireUser();
    const supabase = await createClient();
    const { bedId } = await params;

    // RLS ensures the user owns the bed (via garden ownership).
    const { data: bed } = await supabase.from('beds').select('id').eq('id', bedId).single();
    if (!bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { changes } = BodySchema.parse(await req.json());

    const toDelete = changes.filter((c) => c.plantSlug === null);
    const toUpsert = changes.filter((c) => c.plantSlug !== null);

    // Resolve plant slugs -> ids in one query.
    const slugs = [...new Set(toUpsert.map((c) => c.plantSlug as string))];
    const slugToId = new Map<string, string>();
    if (slugs.length > 0) {
      const { data: plants } = await supabase.from('plants').select('id, slug').in('slug', slugs);
      for (const p of plants ?? []) slugToId.set(p.slug, p.id);
      const unknown = slugs.find((s) => !slugToId.has(s));
      if (unknown) return NextResponse.json({ error: `Unknown plant: ${unknown}` }, { status: 400 });
    }

    if (toUpsert.length > 0) {
      const now = new Date().toISOString();
      const rows = toUpsert.map((c) => ({
        bed_id: bedId,
        row: c.row,
        col: c.col,
        plant_id: slugToId.get(c.plantSlug as string)!,
        updated_at: now,
      }));
      const { error } = await supabase
        .from('planting_slots')
        .upsert(rows, { onConflict: 'bed_id,row,col' });
      if (error) throw error;
    }

    if (toDelete.length > 0) {
      const orFilter = toDelete.map((c) => `and(row.eq.${c.row},col.eq.${c.col})`).join(',');
      const { error } = await supabase
        .from('planting_slots')
        .delete()
        .eq('bed_id', bedId)
        .or(orFilter);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'api/beds/[id]/slots PUT');
  }
}

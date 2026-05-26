import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ApplyPresetSchema = z.object({
  slots: z.array(z.object({
    row: z.number().int().min(0),
    col: z.number().int().min(0),
    slug: z.string().min(1),
  })).max(2000),
});

/**
 * Apply a preset to a bed — wipe all existing slots, insert new ones in one
 * batch. RLS via the bed's garden ownership chain protects the bed_id.
 *
 * Wipes are intentional: presets are "design my whole bed for me" rather
 * than "merge into the corners I haven't filled yet". The client confirms
 * the wipe with the user before calling this.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bedId: string }> },
) {
  try {
    await requireUser();
    const supabase = await createClient();
    const { bedId } = await params;

    const { data: bed } = await supabase
      .from('beds')
      .select('id, rows, cols')
      .eq('id', bedId)
      .single();
    if (!bed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { slots } = ApplyPresetSchema.parse(await req.json());

    // Validate every slot is inside the bed.
    for (const s of slots) {
      if (s.row >= bed.rows || s.col >= bed.cols) {
        return NextResponse.json({ error: 'Slot out of bounds' }, { status: 400 });
      }
    }

    // Resolve slugs → plant ids in one query
    const slugs = Array.from(new Set(slots.map((s) => s.slug)));
    const { data: plants } = await supabase
      .from('plants')
      .select('id, slug')
      .in('slug', slugs);
    const idBySlug = new Map((plants ?? []).map((p) => [p.slug, p.id]));
    const missing = slugs.filter((s) => !idBySlug.has(s));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Unknown plants: ${missing.join(', ')}` },
        { status: 400 },
      );
    }

    // Wipe + insert. Not atomic via two REST calls, but if insert fails the
    // bed is empty — recoverable, not data loss.
    const { error: delErr } = await supabase
      .from('planting_slots')
      .delete()
      .eq('bed_id', bedId);
    if (delErr) throw delErr;

    const rows = slots.map((s) => ({
      bed_id: bedId,
      row: s.row,
      col: s.col,
      plant_id: idBySlug.get(s.slug)!,
    }));

    const { error: insErr } = await supabase.from('planting_slots').insert(rows);
    if (insErr) throw insErr;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    return apiError(err, 'api/beds/[id]/preset POST');
  }
}

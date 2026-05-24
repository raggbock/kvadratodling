import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { GardenDetailClient } from './GardenDetailClient';

export default async function GardenPage({
  params,
}: {
  params: Promise<{ gardenId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { gardenId } = await params;
  const { data: raw } = await supabase
    .from('gardens')
    .select('id, name, description, location, width_cm, length_cm, beds(id, name, rows, cols, width_cm, length_cm, planting_slots(id))')
    .eq('id', gardenId)
    .single();

  if (!raw) notFound();

  type RawBed = {
    id: string; name: string; rows: number; cols: number;
    width_cm: number | null; length_cm: number | null;
    planting_slots: { id: string }[];
  };

  const garden = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    location: raw.location,
    widthCm: raw.width_cm,
    lengthCm: raw.length_cm,
    beds: (raw.beds as RawBed[]).map((b) => ({
      id: b.id,
      name: b.name,
      rows: b.rows,
      cols: b.cols,
      widthCm: b.width_cm,
      lengthCm: b.length_cm,
      plantingSlots: b.planting_slots,
    })),
  };

  return <GardenDetailClient garden={garden} />;
}

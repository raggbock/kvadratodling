import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { EditGardenClient } from './EditGardenClient';

export default async function EditGardenPage({
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
    .select('id, name, description, location, last_frost_date, width_cm, length_cm')
    .eq('id', gardenId)
    .single();

  if (!raw) notFound();

  const garden = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    location: raw.location,
    lastFrostDate: raw.last_frost_date,
    widthCm: raw.width_cm,
    lengthCm: raw.length_cm,
  };

  return <EditGardenClient garden={garden} />;
}

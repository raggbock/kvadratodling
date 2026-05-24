import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getPlant, PLANTS as CATALOG_PLANTS } from '@/lib/plants';
import BedPlanner from './BedPlanner';

export default async function BedPage({
  params,
}: {
  params: Promise<{ gardenId: string; bedId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { gardenId, bedId } = await params;
  const { data: bed } = await supabase
    .from('beds')
    .select('id, name, rows, cols, width_cm, length_cm, garden:gardens(name), planting_slots(id, row, col, plant:plants(slug, common_name))')
    .eq('id', bedId)
    .eq('garden_id', gardenId)
    .single();

  if (!bed) notFound();

  const garden = bed.garden as unknown as { name: string } | null;
  if (!garden) notFound();

  const { data: dbPlants } = await supabase
    .from('plants')
    .select('slug, common_name')
    .eq('is_active', true)
    .order('common_name');

  const palette = (dbPlants ?? []).map((p) => {
    const catalogMatch = CATALOG_PLANTS.find((c) => c.slug === p.slug);
    return { slug: p.slug, name: p.common_name, emoji: catalogMatch?.emoji ?? '🌱' };
  });

  const slots = bed.planting_slots as unknown as { row: number; col: number; plant: { slug: string; common_name: string } | null }[];
  const initialSlots = slots.map((s) => {
    const catalogPlant = s.plant ? getPlant(s.plant.slug) : null;
    const paletteMatch = s.plant ? palette.find((p) => p.slug === s.plant!.slug) : null;
    return {
      row: s.row,
      col: s.col,
      plantSlug: s.plant?.slug ?? null,
      plantEmoji: paletteMatch?.emoji ?? catalogPlant?.emoji ?? null,
      plantName: s.plant?.common_name ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-700">
          Mina odlingar
        </Link>{' '}
        /{' '}
        <Link href={`/gardens/${gardenId}`} className="hover:text-green-700">
          {garden.name}
        </Link>{' '}
        /
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bed.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {bed.width_cm ?? bed.cols * 30}×{bed.length_cm ?? bed.rows * 30} cm
            &mdash; {bed.cols} × {bed.rows} rutor
            {((bed.width_cm ?? bed.cols * 30) > bed.cols * 30 ||
              (bed.length_cm ?? bed.rows * 30) > bed.rows * 30) && (
              <span className="ml-2 text-xs text-amber-600">
                (planeras som {bed.cols * 30}×{bed.rows * 30} cm — resten är utanför rutnätet)
              </span>
            )}
          </p>
        </div>
      </div>

      <BedPlanner
        bedId={bedId}
        rows={bed.rows}
        cols={bed.cols}
        initialSlots={initialSlots}
        palette={palette}
      />
    </div>
  );
}

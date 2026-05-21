import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getPlant, PLANTS as CATALOG_PLANTS } from '@/lib/plants';
import BedPlanner from './BedPlanner';

export default async function BedPage({
  params,
}: {
  params: Promise<{ gardenId: string; bedId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { gardenId, bedId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/gardens');

  const bed = await prisma.bed.findFirst({
    where: { id: bedId, garden: { id: gardenId, userId: user.id } },
    include: {
      garden: { select: { name: true } },
      plantingSlots: { include: { plant: { select: { slug: true, commonName: true } } } },
    },
  });
  if (!bed) notFound();

  const dbPlants = await prisma.plant.findMany({
    select: { slug: true, commonName: true },
    where: { isActive: true },
    orderBy: { commonName: 'asc' },
  });

  // Build a palette merging DB plants with catalog emojis
  const palette = dbPlants.map((p) => {
    const catalogMatch = CATALOG_PLANTS.find((c) => c.slug === p.slug);
    return { slug: p.slug, name: p.commonName, emoji: catalogMatch?.emoji ?? '🌱' };
  });

  const initialSlots = bed.plantingSlots.map((s) => {
    const catalogPlant = s.plant ? getPlant(s.plant.slug) : null;
    const paletteMatch = s.plant ? palette.find((p) => p.slug === s.plant!.slug) : null;
    return {
      row: s.row,
      col: s.col,
      plantSlug: s.plant?.slug ?? null,
      plantEmoji: paletteMatch?.emoji ?? catalogPlant?.emoji ?? null,
      plantName: s.plant?.commonName ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-700">
          My gardens
        </Link>{' '}
        /{' '}
        <Link href={`/gardens/${gardenId}`} className="hover:text-green-700">
          {bed.garden.name}
        </Link>{' '}
        /
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bed.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {bed.cols} × {bed.rows} squares &mdash; {bed.cols * bed.rows} sq ft total
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

import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function GardenPage({
  params,
}: {
  params: Promise<{ gardenId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { gardenId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/gardens');

  const garden = await prisma.garden.findFirst({
    where: { id: gardenId, userId: user.id },
    include: {
      beds: {
        orderBy: { createdAt: 'asc' },
        include: {
          plantingSlots: { include: { plant: { select: { slug: true, commonName: true } } } },
        },
      },
    },
  });
  if (!garden) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 text-sm text-gray-500">
        <Link href="/gardens" className="hover:text-green-700">
          My gardens
        </Link>{' '}
        /
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{garden.name}</h1>
          {garden.description && (
            <p className="mt-1 text-sm text-gray-500">{garden.description}</p>
          )}
          {garden.location && (
            <p className="mt-1 text-xs text-gray-400">📍 {garden.location}</p>
          )}
        </div>
        <Link
          href={`/gardens/${gardenId}/beds/new`}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          + Add bed
        </Link>
      </div>

      {garden.beds.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mb-3 text-4xl">🛏</div>
          <h2 className="mb-1 font-semibold text-gray-700">No beds yet</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add a bed to start planning your layout.
          </p>
          <Link
            href={`/gardens/${gardenId}/beds/new`}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Add a bed
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {garden.beds.map((bed) => {
            const filled = bed.plantingSlots.length;
            const total = bed.rows * bed.cols;
            const pct = Math.round((filled / total) * 100);
            return (
              <Link
                key={bed.id}
                href={`/gardens/${gardenId}/beds/${bed.id}`}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
              >
                <h2 className="font-semibold text-gray-900">{bed.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {bed.cols} × {bed.rows} squares ({bed.cols * bed.rows} sq ft)
                </p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>{filled} planted</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-green-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

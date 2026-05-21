import { notFound } from 'next/navigation';
import { getAllPlants, getPlantBySlug } from '@/lib/plantsYaml';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllPlants().map((p) => ({ id: p.slug }));
}

export default async function DebugPlantPage({ params }: Props) {
  const { id } = await params;
  const plant = getPlantBySlug(id);
  if (!plant) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-mono text-sm">
      <p className="mb-4 text-xs text-gray-400">
        DEBUG — /debug/plants/{id} — data from data/plants/plants.yaml
      </p>
      <h1 className="mb-6 text-xl font-bold text-gray-900">
        {plant.emoji} {plant.nameSv} ({plant.name})
      </h1>
      <pre className="overflow-x-auto rounded-xl bg-gray-950 p-6 text-green-300">
        {JSON.stringify(plant, null, 2)}
      </pre>
    </div>
  );
}

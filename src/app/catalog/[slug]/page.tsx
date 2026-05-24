import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PLANTS, getPlant, SUN_LABELS, SUN_ICONS, WATER_LABELS, WATER_ICONS } from '@/lib/plants';
import { getAllCompanions } from '@/lib/companion-planting';
import { CompanionHint } from '@/components/CompanionHint';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLANTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = getPlant(slug);
  if (!plant) return {};
  return {
    title: `${plant.nameSv} | Kvadratodling`,
    description: plant.description,
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { slug } = await params;
  const plant = getPlant(slug);
  if (!plant) notFound();

  const companions = getAllCompanions(plant.slug);
  const goodCompanions = companions.filter((c) => c.kind === 'good');
  const badCompanions = companions.filter((c) => c.kind === 'bad');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/catalog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
      >
        ← Tillbaka till katalogen
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <span className="text-6xl" aria-hidden>
          {plant.emoji}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{plant.nameSv}</h1>
          <p className="text-gray-400">{plant.name} · {plant.family}</p>
        </div>
      </div>

      <p className="mt-5 text-gray-700">{plant.description}</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Per ruta" value={`${plant.plantsPerSquare} st`} />
        <Stat label="Sol" value={`${SUN_ICONS[plant.sunRequirement]} ${SUN_LABELS[plant.sunRequirement]}`} />
        <Stat label="Vatten" value={`${WATER_ICONS[plant.waterRequirement]} ${WATER_LABELS[plant.waterRequirement]}`} />
        <Stat label="Dagar till skörd" value={`${plant.daysToHarvest} dagar`} />
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">💡 Tips</p>
        <p className="mt-1 text-sm text-amber-700">{plant.tips}</p>
      </div>

      {/* Tags */}
      {plant.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {plant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Companion planting */}
      {companions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Sällskapsplantering</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tipsen visas i planeraren när grannrutorna är upptagna.
          </p>

          {goodCompanions.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-green-700">✅ Goda grannar</h3>
              <div className="flex flex-col gap-2">
                {goodCompanions.map((hint) => (
                  <CompanionHint key={hint.otherPlantSlug} hint={hint} />
                ))}
              </div>
            </div>
          )}

          {badCompanions.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-red-700">⚠️ Dåliga grannar</h3>
              <div className="flex flex-col gap-2">
                {badCompanions.map((hint) => (
                  <CompanionHint key={hint.otherPlantSlug} hint={hint} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {companions.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          Ingen sällskapsplanterings-data för den här växten ännu.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import {
  SUN_LABELS,
  SUN_ICONS,
  WATER_LABELS,
  WATER_ICONS,
  formatDaysToHarvest,
} from '@/lib/plant-display';
import { CompanionHint } from '@/components/CompanionHint';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: plant } = await supabase
    .from('plants')
    .select('common_name, description')
    .eq('slug', slug)
    .single();
  if (!plant) return {};
  return {
    title: `${plant.common_name} | Kvadratodling`,
    description: plant.description ?? undefined,
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: plant } = await supabase
    .from('plants')
    .select(
      'id, slug, common_name, english_name, scientific_name, family, emoji, plants_per_sqft, sun_requirement, water_need, days_to_maturity_min, days_to_maturity_max, description, tips, pests, diseases, tags, zones_min, zones_max, zones_note',
    )
    .eq('slug', slug)
    .single();

  if (!plant) notFound();

  // Disambiguate the FK explicitly — plant_compatibility has two FKs to plants.
  const { data: compat } = await supabase
    .from('plant_compatibility')
    .select(
      'relationship, notes, other_plant:plants!plant_compatibility_other_plant_id_fkey(slug, common_name, emoji)',
    )
    .eq('plant_id', plant.id);

  type CompatRow = {
    relationship: 'companion' | 'antagonist';
    notes: string | null;
    other_plant: { slug: string; common_name: string; emoji: string } | null;
  };
  const rows = ((compat ?? []) as unknown as CompatRow[]).filter((r) => r.other_plant);
  const companions = rows.filter((r) => r.relationship === 'companion');
  const antagonists = rows.filter((r) => r.relationship === 'antagonist');

  const days = formatDaysToHarvest(plant.days_to_maturity_min, plant.days_to_maturity_max);
  const subtitle = [plant.english_name, plant.scientific_name, plant.family]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/catalog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
      >
        ← Tillbaka till katalogen
      </Link>

      <div className="flex items-start gap-5">
        <span className="text-6xl" aria-hidden>
          {plant.emoji}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{plant.common_name}</h1>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
      </div>

      {plant.description && <p className="mt-5 text-gray-700">{plant.description}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Per ruta" value={`${plant.plants_per_sqft} st`} />
        <Stat
          label="Sol"
          value={`${SUN_ICONS[plant.sun_requirement]} ${SUN_LABELS[plant.sun_requirement]}`}
        />
        <Stat
          label="Vatten"
          value={`${WATER_ICONS[plant.water_need]} ${WATER_LABELS[plant.water_need]}`}
        />
        {days && <Stat label="Dagar till skörd" value={days} />}
      </div>

      {(plant.zones_min || plant.zones_max) && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-400">Odlingszoner</p>
          <p className="mt-0.5 text-sm font-medium text-gray-800">
            {plant.zones_min}
            {plant.zones_min && plant.zones_max && plant.zones_min !== plant.zones_max
              ? `–${plant.zones_max}`
              : ''}
            {plant.zones_note && <span className="ml-2 font-normal text-gray-500">— {plant.zones_note}</span>}
          </p>
        </div>
      )}

      {plant.tips && (
        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">💡 Tips</p>
          <p className="mt-1 text-sm text-amber-700">{plant.tips}</p>
        </div>
      )}

      {plant.tags && plant.tags.length > 0 && (
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

      {((plant.pests && plant.pests.length > 0) || (plant.diseases && plant.diseases.length > 0)) && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plant.pests && plant.pests.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Skadegörare
              </p>
              <p className="mt-1 text-sm text-gray-700">{plant.pests.join(', ')}</p>
            </div>
          )}
          {plant.diseases && plant.diseases.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sjukdomar
              </p>
              <p className="mt-1 text-sm text-gray-700">{plant.diseases.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {companions.length > 0 || antagonists.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Sällskapsplantering</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tipsen visas i planeraren när grannrutorna är upptagna.
          </p>

          {companions.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-green-700">✅ Goda grannar</h3>
              <div className="flex flex-col gap-2">
                {companions.map((c) => (
                  <CompanionHint
                    key={c.other_plant!.slug}
                    kind="good"
                    other={c.other_plant!}
                    notes={c.notes}
                  />
                ))}
              </div>
            </div>
          )}

          {antagonists.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-red-700">⚠️ Dåliga grannar</h3>
              <div className="flex flex-col gap-2">
                {antagonists.map((c) => (
                  <CompanionHint
                    key={c.other_plant!.slug}
                    kind="bad"
                    other={c.other_plant!}
                    notes={c.notes}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
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

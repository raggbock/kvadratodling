import { cache } from 'react';
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
import { JsonLd } from '@/components/JsonLd';
import { buildPlantFaq, faqJsonLd } from '@/lib/plant-faq';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Build a meta description even when plant.description is empty — derived
// from structured fields so Google has something better than the title.
function deriveDescription(p: {
  common_name: string;
  description: string | null;
  plants_per_sqft: number;
  sun_requirement: 'full_sun' | 'part_shade' | 'full_shade';
  water_need: 'low' | 'medium' | 'high';
  zones_min: string | null;
  zones_max: string | null;
  days_to_maturity_min: number | null;
  days_to_maturity_max: number | null;
}): string {
  if (p.description && p.description.length >= 60) return p.description.slice(0, 300);
  const bits: string[] = [`Odla ${p.common_name.toLowerCase()} i pallkrage på svensk vis.`];
  if (p.plants_per_sqft >= 2) bits.push(`${p.plants_per_sqft} plantor per ruta`);
  else if (p.plants_per_sqft < 1) bits.push(`Behöver ${Math.round(1 / p.plants_per_sqft)} rutor per planta`);
  bits.push(`${SUN_LABELS[p.sun_requirement].toLowerCase()}`);
  bits.push(`${WATER_LABELS[p.water_need].toLowerCase()} vattenbehov`);
  if (p.zones_min) bits.push(`zoner ${p.zones_min}${p.zones_max && p.zones_max !== p.zones_min ? `–${p.zones_max}` : ''}`);
  if (p.days_to_maturity_min) bits.push(`skördas på ${p.days_to_maturity_min}${p.days_to_maturity_max && p.days_to_maturity_max !== p.days_to_maturity_min ? `–${p.days_to_maturity_max}` : ''} dagar`);
  return bits.join(' · ');
}

// Catalog data is public + slow-moving — let Next.js cache the page for an hour.
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

// React.cache dedupes the plant fetch across generateMetadata + the page render
// within a single request. Without this, every catalog detail page hits Supabase twice.
const getPlant = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('plants')
    .select(
      'id, slug, common_name, english_name, scientific_name, family, emoji, plants_per_sqft, sun_requirement, water_need, days_to_maturity_min, days_to_maturity_max, frost_tolerant, sow_indoors_days_before_frost, direct_sow_days_before_frost, transplant_days_after_frost, description, tips, pests, diseases, tags, zones_min, zones_max, zones_note',
    )
    .eq('slug', slug)
    .single();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) return {};
  const description = deriveDescription(plant);
  const titleParts = [plant.common_name];
  if (plant.english_name && plant.english_name !== plant.common_name) {
    titleParts.push(`(${plant.english_name})`);
  }
  titleParts.push('— odla i pallkrage');
  const title = titleParts.join(' ');
  const url = `${SITE_URL}/catalog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/catalog/${slug}` },
    openGraph: {
      title: `${plant.emoji} ${plant.common_name} — ${SITE_NAME}`,
      description,
      url,
      type: 'article',
      // No explicit `images` — the per-plant opengraph-image.tsx file convention
      // generates the og:image. Setting a static default here suppressed it and
      // served og-default.png for every plant. twitter:image falls back to og.
    },
    twitter: {
      card: 'summary_large_image',
      title: `${plant.emoji} ${plant.common_name}`,
      description,
    },
    keywords: [
      plant.common_name.toLowerCase(),
      plant.english_name?.toLowerCase(),
      plant.scientific_name?.toLowerCase(),
      `odla ${plant.common_name.toLowerCase()}`,
      `${plant.common_name.toLowerCase()} pallkrage`,
      `när så ${plant.common_name.toLowerCase()}`,
      ...(plant.tags ?? []),
    ].filter(Boolean) as string[],
  };
}

export default async function PlantDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const plant = await getPlant(slug);

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
  const description = deriveDescription(plant);
  const url = `${SITE_URL}/catalog/${slug}`;

  // FAQ derived purely from verified fields — see the truth contract in
  // lib/plant-faq.ts. Questions without backing data are omitted.
  const faq = buildPlantFaq({
    commonName: plant.common_name,
    plantsPerSqft: Number(plant.plants_per_sqft),
    sunRequirement: plant.sun_requirement,
    waterNeed: plant.water_need,
    daysToMaturityMin: plant.days_to_maturity_min,
    daysToMaturityMax: plant.days_to_maturity_max,
    frostTolerant: plant.frost_tolerant,
    sowIndoorsDaysBeforeFrost: plant.sow_indoors_days_before_frost,
    directSowDaysBeforeFrost: plant.direct_sow_days_before_frost,
    transplantDaysAfterFrost: plant.transplant_days_after_frost,
    zonesMin: plant.zones_min,
    zonesMax: plant.zones_max,
    zonesNote: plant.zones_note,
    companions: companions.map((c) => c.other_plant!.common_name),
    antagonists: antagonists.map((c) => c.other_plant!.common_name),
  });
  const faqSchema = faq.length > 0 ? faqJsonLd(faq) : null;

  // Article schema — Google's closest fit for "informational guide page".
  // We tag it as Article (not Product, which would imply for-sale).
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${plant.common_name} — odla i pallkrage`,
    description,
    url,
    inLanguage: 'sv-SE',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-grodden.svg` },
    },
    about: {
      '@type': 'Thing',
      name: plant.common_name,
      alternateName: [plant.english_name, plant.scientific_name].filter(Boolean),
    },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Växtkatalog', item: `${SITE_URL}/catalog` },
      { '@type': 'ListItem', position: 3, name: plant.common_name, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={faqSchema ? [articleSchema, breadcrumb, faqSchema] : [articleSchema, breadcrumb]} />
      <Link
        href="/catalog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-link hover:text-brand-emphasis"
      >
        ← Tillbaka till katalogen
      </Link>

      <div className="flex items-start gap-5">
        <span className="text-6xl" aria-hidden>
          {plant.emoji}
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-default">{plant.common_name}</h1>
          {subtitle && <p className="text-text-muted">{subtitle}</p>}
        </div>
      </div>

      {plant.description && <p className="mt-5 text-text-default">{plant.description}</p>}

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
        <div className="mt-4 rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
          <p className="text-xs text-text-muted">Odlingszoner</p>
          <p className="mt-0.5 text-sm font-medium text-text-default">
            {plant.zones_min}
            {plant.zones_min && plant.zones_max && plant.zones_min !== plant.zones_max
              ? `–${plant.zones_max}`
              : ''}
            {plant.zones_note && <span className="ml-2 font-normal text-text-subtle">— {plant.zones_note}</span>}
          </p>
        </div>
      )}

      {plant.tips && (
        <div className="mt-6 rounded-xl border border-status-warning bg-status-warning-subtle px-4 py-3">
          <p className="text-sm font-medium text-status-warning">💡 Tips</p>
          <p className="mt-1 text-sm text-status-warning">{plant.tips}</p>
        </div>
      )}

      {plant.tags && plant.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {plant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-status-positive-subtle px-3 py-1 text-xs font-medium text-status-positive"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {((plant.pests && plant.pests.length > 0) || (plant.diseases && plant.diseases.length > 0)) && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plant.pests && plant.pests.length > 0 && (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Skadegörare
              </p>
              <p className="mt-1 text-sm text-text-default">{plant.pests.join(', ')}</p>
            </div>
          )}
          {plant.diseases && plant.diseases.length > 0 && (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Sjukdomar
              </p>
              <p className="mt-1 text-sm text-text-default">{plant.diseases.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {companions.length > 0 || antagonists.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text-default">Sällskapsplantering</h2>
          <p className="mt-1 text-sm text-text-subtle">
            Tipsen visas i planeraren när grannrutorna är upptagna.
          </p>

          {companions.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-status-positive">✅ Goda grannar</h3>
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
              <h3 className="mb-2 text-sm font-medium text-status-negative">⚠️ Dåliga grannar</h3>
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
        <div className="mt-8 rounded-xl border border-dashed border-border-default p-6 text-center text-sm text-text-muted">
          Ingen sällskapsplanterings-data för den här växten ännu.
        </div>
      )}

      {faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-default">Vanliga frågor</h2>
          <dl className="mt-4 divide-y divide-border-subtle">
            {faq.map((item) => (
              <div key={item.question} className="py-4">
                <dt className="font-medium text-text-default">{item.question}</dt>
                <dd className="mt-1 text-sm text-text-default">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-text-subtle">
            Se{' '}
            <Link href="/verktyg/frostkalkylator" className="text-text-link hover:text-brand-emphasis">
              frostkalkylatorn
            </Link>{' '}
            och{' '}
            <Link href="/odlingsschema" className="text-text-link hover:text-brand-emphasis">
              odlingsschemat
            </Link>{' '}
            för datum anpassade efter din zon.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-text-default">{value}</p>
    </div>
  );
}

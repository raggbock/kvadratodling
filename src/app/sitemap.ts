import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { SITE_URL } from '@/lib/site';
import { SWEDISH_ZONES } from '@/lib/zones';

// Dynamic sitemap. Next.js serves this at /sitemap.xml. ISR-friendly — the
// route is server-rendered but the plant list rarely changes, so we set a
// generous revalidate. Auth pages are excluded; they're noindex anyway.

export const revalidate = 3600;

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/',                            priority: 1.0, changeFrequency: 'weekly' },
  { path: '/catalog',                     priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pallkrage',                   priority: 0.8, changeFrequency: 'monthly' },
  { path: '/sallskapsplantering',         priority: 0.8, changeFrequency: 'monthly' },
  { path: '/odlingszoner',                priority: 0.8, changeFrequency: 'monthly' },
  { path: '/odlingsschema',               priority: 0.8, changeFrequency: 'weekly' },
  { path: '/verktyg/frostkalkylator',     priority: 0.7, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${SITE_URL}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  // Per-zone schedule pages — one entry per Swedish zone.
  for (const zone of SWEDISH_ZONES) {
    entries.push({
      url: `${SITE_URL}/odlingsschema/${zone.id.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Plant detail pages — one entry per active plant.
  try {
    const supabase = await createClient();
    const { data: plants } = await supabase
      .from('plants')
      .select('slug, created_at')
      .eq('is_active', true);

    for (const plant of plants ?? []) {
      entries.push({
        url: `${SITE_URL}/catalog/${plant.slug}`,
        lastModified: plant.created_at ? new Date(plant.created_at) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  } catch {
    // If Supabase is unreachable at build time, ship the static entries.
  }

  return entries;
}

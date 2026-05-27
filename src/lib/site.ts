// Central place for site-wide constants used in metadata, OG, sitemap, JSON-LD.
// Change `SITE_URL` only when the canonical domain changes.

export const SITE_URL = 'https://kvadratodling.se';
export const SITE_NAME = 'Kvadratodling';
export const SITE_TAGLINE = 'Planera din pallkrage kvadrat för kvadrat';
export const SITE_DESCRIPTION =
  'Planera din pallkrage med kvadratmetoden. 100+ växter, sällskapsplantering och ett odlingsschema som följer din sista frost i svenska zoner.';
export const SITE_LOCALE = 'sv_SE';
export const SITE_TWITTER = '@kvadratodling'; // not registered yet — placeholder, OG falls back gracefully
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/og-default.png`; // 1200x630, exists or falls back

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

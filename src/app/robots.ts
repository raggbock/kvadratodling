import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth + private routes shouldn't appear in search results. The pages
        // themselves also redirect unauthenticated traffic, so this is belt-
        // and-suspenders to keep the search index clean.
        disallow: ['/auth/', '/gardens/', '/settings', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

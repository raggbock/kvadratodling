import posthog from 'posthog-js';

export type AnalyticsEvent =
  | { name: 'signed_up'; properties?: { method?: string } }
  | { name: 'garden_created'; properties: { plant_count: number; total_squares: number } }
  | { name: 'plant_added'; properties: { plant_slug: string; square_x: number; square_y: number } }
  | { name: 'catalog_viewed'; properties?: Record<string, unknown> };

export function track(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  posthog.capture(event.name, event.properties ?? {});
}

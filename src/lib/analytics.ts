'use client';

import posthog from 'posthog-js';

/**
 * Per-action analytics events. PostHogProvider handles auto-pageviews;
 * this module is for explicit user-action events that auto-tracking misses.
 */
export type AnalyticsEvent =
  | { name: 'signed_out' }
  | { name: 'garden_created'; properties: { has_dimensions: boolean } }
  | { name: 'garden_deleted' }
  | { name: 'plant_added'; properties: { plant_slug: string; bed_id: string; row: number; col: number } }
  | { name: 'plant_removed'; properties: { bed_id: string; row: number; col: number } }
  | { name: 'catalog_viewed'; properties: { plant_count: number } }
  | { name: 'digest_unsubscribed' }
  | { name: 'preset_applied'; properties: { preset_id: string; bed_id: string; slot_count: number } };

export function track(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  // Don't crash if posthog isn't initialised (no env var, ad-blocker, etc.)
  try {
    posthog.capture(event.name, 'properties' in event ? event.properties : undefined);
  } catch {
    // swallow — analytics must never break the user flow
  }
}

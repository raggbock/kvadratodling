// scripts/lib/enrichment-types.ts

/** How well-supported a proposed value is. `low` is NEVER auto-included. */
export type Confidence = 'high' | 'medium' | 'low';

/** One proposed field value with its real, fetched provenance. */
export interface FieldProvenance {
  field: string;            // e.g. "days_to_maturity_max"
  proposedValue: unknown;   // null when no source was found (omit-over-invent)
  currentValue: unknown;    // current DB value, for the diff
  sourceUrl: string | null; // a real URL that was fetched, or null
  quote: string | null;     // exact supporting passage from that URL
  confidence: Confidence;
  flagged: boolean;         // contested/folklore, or sources conflict
  note?: string;            // e.g. "Svensk Trädgård and Impecta disagree"
}

export interface PlantEnrichment {
  slug: string;
  commonName: string;
  fields: FieldProvenance[];
}

# Växtberikning — körbok (källgrundad generering)

Detta är proceduren Claude Code följer för att berika växtdata. Den körs som
ett jobb HÄR (med WebSearch/WebFetch), aldrig som blind textgenerering.

## Hård regel
Fakta får ALDRIG komma ur modellens minne. Varje värde grundas i en faktiskt
hämtad sida från allowlisten nedan, med exakt citat + URL. Hittas ingen källa
→ sätt fältet `null`, `confidence: "low"`, `flagged: true`. Utelämna hellre
än uppfinn. (Samma kontrakt som `src/lib/plant-faq.ts` och `memory/verified-data-only.md`.)

## Käll-allowlist (rangordnad, svenska/klimatspecifika först)
1. Riksförbundet Svensk Trädgård — zoner, frosttålighet, svenska såfönster.
2. SLU / Jordbruksverket — skadegörare, sjukdomar, växtbiologi.
3. Svenska fröföretag (Impecta, Runåbergs, Lindbloms, Nelson Garden) — dagar
   till skörd, sådd-offset, plantavstånd.
4. Square Foot Gardening (Mel Bartholomew) — ENDAST `plants_per_sqft`.

Bloggar/forum/oidentifierade källor räknas inte.

## Fält → källa
| Fält | Källa | Regel |
|---|---|---|
| zones_min/max/note, frost_tolerant | Svensk Trädgård | — |
| sow_indoors/direct_sow/transplant_*_frost | Svensk Trädgård + fröföretag | relativt sista frost, ALDRIG absolut månad |
| days_to_maturity_min/max | Fröföretag | sortvariation → spann; konflikt → flagga |
| plants_per_sqft | SFG, korskolla plantavstånd via `spacingToPlantsPerSqft` | avvikelse → flagga |
| pests, diseases | SLU/Jordbruksverket | — |
| companions, antagonists | Endast med namngiven källa | annars utelämna + flagga (folklore) |
| description, tips | Syntetisera ENBART ur redan verifierade fält | inga nya fakta |

## Per fält
1. WebSearch mot rätt källa enligt tabellen.
2. WebFetch den faktiska sidan.
3. Extrahera värdet + exakt stödcitat + URL. Saknas → null/low/flagged.
4. Korsverifiera enligt regeln. Konflikt → båda sparas, `flagged: true`.
5. Sätt konfidens: `high` (≥2 godkända källor enas / 1 auktoritativ för
   fälttypen) · `medium` (1 ok källa) · `low` (tunt/omtvistat).

## Output
1. `data/plants/<batch>.records.json` — `PlantEnrichment[]`
   (se `scripts/lib/enrichment-types.ts`).
2. Kör `npx tsx scripts/enrich-report.ts data/plants/<batch>.records.json <batch>`
   → `data/plants/review/<batch>.md`.
3. Presentera rapporten. Efter användarens ✓: bygg `data/plants/<batch>.plants.json`
   (Zod-schemat i `scripts/import-plants.ts`) med BARA godkända fält (konfidens
   ≥ medium, ej avvisade), och kör `npm run import:plants -- data/plants/<batch>.plants.json`.

# Stöd för höstsatta grödor — design

**Datum:** 2026-05-29
**Status:** Godkänd design (inväntar spec-granskning)
**Mål:** Låta växter som sätts på hösten och skördas nästa sommar (t.ex. vitlök) representeras sanningsenligt i schema och odlingsschema — utan att tvinga in dem i de vårfrost-relativa såfälten.

## Bakgrund

`computeSchedule(lastFrostDate, plants)` i `src/lib/plantSchedule.ts` ankrar alla
händelser (`sow_indoors`, `direct_sow`, `transplant`, `harvest_start`,
`harvest_end`) på **sista vårfrost**. Det kan inte uttrycka höstsättning.

Två befintliga fakta gör en minimal lösning möjlig:
- `src/lib/zones.ts` har redan `firstFrostMD` (genomsnittlig första höstfrost) per zon.
- Skörd beräknas som `planteringsdatum + days_to_maturity`. Ankras det på ett
  höstdatum landar skörden automatiskt nästa sommar.

Sanningsregeln gäller: vitlökens faktiska siffror är **data** och går genom
enrichment-granskningen ([[verified-data-only]] / `data/plants/ENRICHMENT-PROMPT.md`),
inte den här schema-PR:en.

## Vald modell

En ny nullbar kolumn på `plants`:

```
autumn_plant_days_before_first_frost  INT  NULL
```

- `null` → vårsatt växt (oförändrat beteende).
- icke-null → höstsatt. Värdet = antal dagar **före** zonens första höstfrost som
  klyftan/plantan sätts (speglar `sow_indoors_days_before_frost`-semantiken;
  0 ≈ vid första frost, positivt = tidigare).

Höstsatta växter har sina vår-såfält (`sow_indoors_/direct_sow_/transplant_*_frost`)
satta till `null`.

## Komponenter

### 1. `src/lib/plantSchedule.ts` (kärnan, TDD)
- Ny `ScheduleEventKind`: `plant_autumn` (etikett "Sätt på hösten").
- `PlantScheduleInput` får `autumnPlantDaysBeforeFirstFrost: number | null`.
- Ny signatur: `computeSchedule(lastFrostDate: Date, plants: PlantScheduleInput[], firstFrostDate?: Date)`.
  `firstFrostDate` är valfri → befintliga anrop fungerar tills de uppdateras;
  höstevent emitteras bara när BÅDE fältet och `firstFrostDate` finns.
- Logik per höstsatt växt:
  - `plantDate = addDays(firstFrostDate, -autumnPlantDaysBeforeFirstFrost)`
  - emittera `plant_autumn` på `plantDate`
  - `harvestBaseDate = plantDate`; emittera `harvest_start`/`harvest_end` på
    `plantDate + daysToMaturityMin/Max`
  - hoppa över vår-logiken (sow/transplant) för den växten.
- `KIND_STYLES` får en post för `plant_autumn`.

### 2. `src/lib/zones.ts`
- Ny hjälpare `firstFrostDateForYear(firstFrostMD, year)` som speglar befintliga
  `lastFrostDateForYear`.

### 3. Anropsställen för `computeSchedule`
Var och en beräknar `firstFrostDate`, skickar in det, läser den nya kolumnen och
lägger till `plant_autumn` i sina `KIND_LABELS`:
- `src/app/odlingsschema/[zon]/page.tsx`
- `src/app/gardens/[gardenId]/schedule/page.tsx`
- `src/app/api/gardens/route.ts`
- `src/app/api/gardens/[gardenId]/route.ts`
- `src/app/gardens/new/NewGardenForm.tsx`
- `src/app/gardens/[gardenId]/edit/EditGardenClient.tsx`

Månadsgrupperingen (`getMonth()`) hanterar redan en skörd nästa år korrekt.

### 4. Import (`scripts/import-plants.ts`)
- `autumn_plant_days_before_first_frost: z.number().int().nullable().optional()` i `PlantSchema`.
- Mappa i `toPlantInsert`.
- Regenerera `src/utils/supabase/database.types.ts` (eller lägg till fältet för hand).

### 5. Migration
- Lägg kolumnen via Supabase MCP `apply_migration` (DDL) mot live-DB:n.
- Committa en migrationsfil för repo-spår, konsekvent med befintlig migrationsstruktur.

## Vitlök-datan (separat, grindat steg)
Efter att mekanismen är på plats: en liten enrichment-batch för vitlök
(`autumn_plant_days_before_first_frost` + clove-to-harvest `days_to_maturity`),
källgrundad och granskad innan import. Siffror uppfinns inte här.

## Testning
- `src/lib/plantSchedule.test.ts` (ny, TDD): en höstsatt input ger ett
  `plant_autumn`-event på `firstFrost − offset` och ett `harvest_start`-event
  `days_to_maturity` senare (nästa sommar). Vårsatt input påverkas inte och
  ger inga höstevent. `firstFrostDate` utelämnad → inga höstevent.

## Avgränsningar (YAGNI)
- Ingen `planting_season`-enum, inga dedikerade höst-skördefält — en kolumn räcker.
- Ingen ny UI-vy; bara en ny händelsetyp i befintliga scheman.
- Inga uppfunna växtvärden; vitlökens siffror går via granskningsgrinden.
- Vårsatta växters beteende är oförändrat.

## Öppna frågor
Inga — modellval fastställt i brainstorm 2026-05-29.

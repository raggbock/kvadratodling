# Plant Database Schema — v1

Each entry in `plants.yaml` represents one crop variety.

## Top-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes | URL-safe, Swedish-first identifier (e.g. `tomat`, `morot`) |
| `name` | string | yes | English common name |
| `nameSv` | string | yes | Swedish common name |
| `family` | string | yes | Botanical family |
| `plantsPerSquare` | integer | yes | Plants per 30×30 cm square (square-foot gardening density) |
| `sunRequirement` | `full` \| `partial` \| `shade` | yes | Daily sunlight needs |
| `waterRequirement` | `low` \| `medium` \| `high` | yes | Relative watering frequency |
| `description` | string | yes | 1–3 sentence growing description |
| `tips` | string | yes | 1–2 sentence key tip |
| `emoji` | string | yes | Single representative emoji |
| `tags` | string[] | yes | Free-form tags for filtering (e.g. `vegetable`, `cool-season`, `staking`) |

## `timing` object (required for planting algorithm — KVA-13)

All values are in **days relative to last spring frost date** for the growing zone.
Positive = before last frost. Negative = after last frost.

| Field | Type | Notes |
|---|---|---|
| `sowIndoorsDaysBeforeFrost` | integer \| null | Days before last frost to sow indoors. `null` if not started indoors. |
| `directSowDaysBeforeFrost` | integer \| null | Days before last frost for direct sowing. Negative = after frost. `null` if not direct-sown. |
| `transplantDaysAfterFrost` | integer \| null | Days after last frost to transplant out. `null` if not transplanted (direct-sown only). |
| `daysToMaturityMin` | integer | Minimum days from outdoor placement (transplant or direct sow) to first harvest |
| `daysToMaturityMax` | integer | Maximum days from outdoor placement to last harvest window |

### Special cases

- **Autumn-planted crops** (e.g. vitlök): set all timing fields to `null` and document in `tips`.
- **Cut-and-come-again crops**: `daysToMaturityMin` = first harvest, `daysToMaturityMax` = last practical harvest.

## `zones` object (required for zone filtering — KVA-13)

Swedish growing zones Z1 (Skåne, warmest) through Z8 (Lapland, coldest).
See `src/lib/zones.ts` for full zone definitions.

| Field | Type | Notes |
|---|---|---|
| `min` | `Z1`–`Z8` | Southernmost/warmest zone that makes sense for this crop |
| `max` | `Z1`–`Z8` | Northernmost/coldest zone the crop can succeed in |
| `note` | string \| null | Optional free-text caveat (e.g. "needs warmest microclimate in Z6") |

## `pests` and `diseases` arrays (for display — KVA-14)

Simple string arrays. Use Swedish common names for pests and diseases.
Keep the list to 2–5 most relevant entries per crop.

```yaml
pests:
  - bladlöss
  - spinnkvalster
diseases:
  - gråmögel
  - brunröta
```

## Schema gaps flagged at v1

The following fields exist in `PlantScheduleInput` (src/lib/plantSchedule.ts) but are NOT yet in
the TypeScript `Plant` type (src/lib/plants.ts). Whoever wires the planting algorithm will need
to bridge these:

- `sowIndoorsDaysBeforeFrost` → `timing.sowIndoorsDaysBeforeFrost`
- `directSowDaysBeforeFrost` → `timing.directSowDaysBeforeFrost`
- `transplantDaysAfterFrost` → `timing.transplantDaysAfterFrost`
- `daysToMaturityMin` / `daysToMaturityMax` → `timing.daysToMaturityMin/Max`

The current hardcoded `PLANTS` array only has `daysToHarvest` (a single flat value), which is
insufficient for the schedule algorithm. Migration should happen in KVA-13.

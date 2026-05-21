# Architecture

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Push-to-deploy on Vercel with zero config; App Router gives server components and easy API routes in one repo |
| Hosting | Vercel | Native Next.js integration, preview deployments on every PR, generous free tier for early stage |
| Database | Supabase (Postgres) | Managed Postgres with a free tier, built-in connection pooling, and a REST/realtime layer we can add later |
| Auth | Supabase Auth | Co-located with the database, eliminates a second managed service; supports email/password and OAuth out of the box |
| Styling | Tailwind CSS | Utility-first, fast iteration without naming CSS classes |
| Language | TypeScript | Default — type safety across the full stack |

## Repository layout

```
src/
  app/
    page.tsx          # Root page ("Hello Kvadratodling")
    layout.tsx        # Root layout with global styles
    api/
      health/
        route.ts      # GET /api/health — liveness probe
ARCHITECTURE.md       # This file
```

## Deploy

Push to `main` → Vercel auto-deploys to production.  
Every PR branch gets an isolated preview URL.

**One-command deploy (first time):**
```bash
npx vercel --prod
```

## Key decisions / deviations from defaults

- **Supabase for both Postgres and Auth** instead of separate Fly.io Postgres + Clerk: reduces the number of managed services from 3 to 2, and both are free tier at launch. Revisit if Supabase Postgres limits become a constraint at scale.
- **Prisma ORM added in KVA-3** for type-safe queries and migration tooling. Prisma 7 config lives in `prisma.config.ts`; the datasource URL is not in `schema.prisma`.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon/public key
DATABASE_URL=                  # Postgres connection string (for Prisma)
```

Copy `.env.local.example` to `.env.local` and fill in values from the Supabase dashboard.

---

## Data Model

```
User ──< Garden ──< Bed ──< PlantingSlot >── Plant
                                              │
                            PlantCompatibility (self-join on Plant)
```

### Entity reference

#### User

Mirrors `auth.users` from Supabase Auth. The `id` column is set to the Supabase auth UID; no separate mapping column is needed.

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (UUID) | = Supabase `auth.users.id` |
| email | TEXT UNIQUE | Synced from auth |
| name | TEXT? | Display name |
| created_at / updated_at | TIMESTAMPTZ | |

#### Garden

A named garden belonging to one user. A user can have multiple gardens (balcony, backyard, etc.).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| user_id | FK→users | CASCADE delete |
| name | TEXT | Required |
| description | TEXT? | |
| location | TEXT? | Free text: "backyard", "rooftop" |
| last_frost_date | DATE? | Used to compute planting windows for this garden |
| created_at / updated_at | TIMESTAMPTZ | |

#### Bed

A raised bed or square-foot plot grid. Dimensions in whole square-foot cells (rows × cols).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| garden_id | FK→gardens | CASCADE delete |
| name | TEXT | e.g. "Raised Bed #1" |
| rows | INT | Number of rows in grid |
| cols | INT | Number of columns in grid |
| notes | TEXT? | Soil mix, orientation, etc. |
| created_at / updated_at | TIMESTAMPTZ | |

#### Plant (Species Catalog)

Shared reference data — not user-owned. Populated by `prisma/seed.ts`. 25 plants at launch.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| slug | TEXT UNIQUE | e.g. `cherry-tomato` |
| common_name | TEXT | |
| scientific_name | TEXT? | |
| family | TEXT? | Botanical family |
| emoji | TEXT | Display emoji, default 🌱 |
| plants_per_sqft | DECIMAL(5,2) | SFG key metric. 16=radish, 9=carrot, 4=lettuce, 1=tomato, 0.25=zucchini |
| sun_requirement | ENUM | `full_sun`, `part_shade`, `full_shade` |
| water_need | ENUM | `low`, `medium`, `high` |
| days_to_maturity_min / max | INT? | Range |
| frost_tolerant | BOOLEAN | For season planner |
| sow_indoors_days_before_frost | INT? | Days before last frost to start seeds indoors |
| direct_sow_days_before_frost | INT? | Positive = before frost (cool-season); negative = after frost (warm-season) |
| transplant_days_after_frost | INT? | Days after last frost to transplant outdoors |
| notes | TEXT? | Growing tips |
| image_url | TEXT? | |
| is_active | BOOLEAN | Soft-delete for catalog management |
| created_at | TIMESTAMPTZ | |

#### PlantCompatibility

Bidirectional companion/antagonist relationships. The seed script writes both (A→B) and (B→A) so lookups need only `WHERE plant_id = $id`.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| plant_id | FK→plants | CASCADE delete |
| other_plant_id | FK→plants | CASCADE delete |
| relationship | ENUM | `companion`, `antagonist` |
| notes | TEXT? | |
| — | UNIQUE(plant_id, other_plant_id) | |

#### PlantingSlot

Each cell in a Bed grid. Rows/cols are 0-indexed. A missing row = empty cell (slots are created on demand, not pre-provisioned).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| bed_id | FK→beds | CASCADE delete |
| row | INT | 0-indexed |
| col | INT | 0-indexed |
| plant_id | FK→plants? | NULL = empty. SET NULL on plant delete |
| planted_at | DATE? | When plant went in |
| notes | TEXT? | Per-slot notes |
| created_at / updated_at | TIMESTAMPTZ | |
| — | UNIQUE(bed_id, row, col) | One plant per cell |

### Design notes

**plants_per_sqft over spacing_inches** — SFG works with whole-cell counts. Storing this directly keeps grid math trivial. Fractional values (0.25, 0.5) mean a plant needs multiple cells.

**Slots created on demand** — not pre-provisioned for every cell. Empty cell = absent row. Avoids inserting `rows × cols` empty rows on bed creation.

**Planting schedule on Plant, not Garden** — `sow_indoors_days_before_frost` etc. are species-level data. The per-garden `last_frost_date` is the anchor; the UI combines both to show "start seeds by March 3rd."

---

## Migrations

```
prisma/
  schema.prisma                     # Source of truth
  seed.ts                           # 25 plants + companion data
  migrations/
    0001_initial/migration.sql      # Full schema creation
```

Apply migrations:
```bash
DATABASE_URL="..." npx prisma migrate deploy
DATABASE_URL="..." npx ts-node prisma/seed.ts
```

# Scripts

## `import-plants.ts` — Cowork → Supabase

Imports a `plants.json` produced by the Cowork prompt into the `plants` and
`plant_compatibility` tables. Idempotent; safe to re-run.

### Setup (once)

1. Grab your **service-role** key from the Supabase Dashboard → Project
   Settings → API → `service_role` key. *This bypasses RLS — never commit it.*
2. Put it in `.env.local` (gitignored) alongside your Supabase URL:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role, NOT anon
   ```

### Run

```bash
npm run import:plants -- ./path/to/plants.json
```

What it does:

- Validates the file against the Cowork schema (Zod). Failures print
  per-field issues.
- Warns about dangling companion/antagonist slug references (they're
  skipped, not fatal).
- Upserts plants on `slug` so re-running just refreshes content.
- Builds bidirectional `plant_compatibility` rows (`A↔B`), deduped and
  chunked.

The schema the file is validated against matches the one in the prompt I
keep in the chat thread — Plant fields like `plants_per_sqft`, `zones.min/max`,
`companions[].slug`, etc.

## Plant enrichment (source-grounded)

Enrich plant data from approved Swedish sources with real citations and a human
review gate. The full procedure lives in `data/plants/ENRICHMENT-PROMPT.md`.

Flow per batch:

1. Agent runs the playbook → `data/plants/<batch>.records.json` (provenance).
2. `npx tsx scripts/enrich-report.ts data/plants/<batch>.records.json <batch>`
   → `data/plants/review/<batch>.md` (your sign-off gate).
3. After you approve, the approved fields are written to a Zod-valid
   `data/plants/<batch>.plants.json` and imported with `npm run import:plants`.

Nothing reaches the DB without your ✓. Facts never come from model memory —
only from fetched, cited sources in the allowlist.

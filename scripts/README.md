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

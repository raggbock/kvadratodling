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
- **No ORM at bootstrap** — will add Drizzle or Prisma when the data model is defined (KVA-3+). Direct Supabase client is sufficient for now.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon/public key
```

Copy `.env.local.example` to `.env.local` and fill in values from the Supabase dashboard.

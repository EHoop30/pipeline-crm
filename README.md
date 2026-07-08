# Pipeline CRM

A small-team sales CRM built with React, Supabase, and Vercel. A shared team
workspace to track companies, deals through a pipeline, and the activity on each
deal, with email/password auth and Postgres Row Level Security.

This is a portfolio project that demonstrates wiring a React front end to a real
Supabase backend and deploying it: authentication, a relational schema with RLS
policies, real-time-persisted CRUD, and a production deploy on Vercel.

## Features

- **Authentication** with Supabase Auth (email/password), protected routes, and
  a redirect to login for unauthenticated users.
- **Dashboard** with pipeline KPIs (open pipeline, weighted pipeline, won this
  month) and a per-stage breakdown.
- **Pipeline board** grouped by stage, with per-card stage changes that persist.
- **Deals table** that is searchable, filterable by stage, sortable on every
  column, and exportable to CSV.
- **Deal detail** with inline editing and an activity log (calls, emails, notes)
  per deal.
- **Shared team data** enforced by Row Level Security: any signed-in teammate
  can read and write the shared book of business; anonymous users get nothing.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, React Router, Supabase
(Postgres + Auth), deployed on Vercel.

## Data model

```
companies ──< deals ──< activities
                deals.owner_id ─> auth.users
```

The SQL lives in `supabase/migrations/` (schema and RLS) and `supabase/seed.sql`
(demo data). See the RLS migration for the access model and how to switch from
shared-team to per-user data.

## Database as code

The schema is managed with the Supabase CLI, not by hand-editing tables.
Migrations live in `supabase/migrations/` and are validated on every pull request
(a workflow replays them on a fresh database), then applied to production by a
GitHub Action on merge to `main`. Locally, `supabase db reset` replays them into
the local stack. The RLS migration also grants table privileges to the
`authenticated` role, so the API works in any environment without depending on a
dashboard setting. Demo data lives in `supabase/seed.sql`.

## Deploy it yourself

### 1. Database (Supabase), deployed by CI

Migrations reach the hosted project through the `Deploy database to production`
GitHub Action, not a manual push. Set it up once:

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Add three repository secrets under Settings > Secrets and variables > Actions:
   - `SUPABASE_ACCESS_TOKEN` from your Supabase account access tokens page
   - `SUPABASE_DB_PASSWORD`, the project's database password
   - `SUPABASE_PROJECT_ID`, the project ref (Settings > General > Reference ID)
3. Deploy the schema. The workflow runs automatically when migrations land on
   `main`; for the first deploy, run it on demand from Actions >
   Deploy database to production > Run workflow.
4. One-time data setup (the demo data and demo login are not schema, so they are
   set up once by hand):
   - Load demo data: paste `supabase/seed.sql` into the SQL editor, or
     `psql "<connection-string>" -f supabase/seed.sql`.
   - Create the demo login: Authentication > Users > Add user,
     `demo@pipelinecrm.app` / `demo1234`, with Auto Confirm on.
5. From Project Settings > API, copy the Project URL and anon public key for the
   Vercel step below.

### 2. App (Vercel)

1. Import this repo at [vercel.com](https://vercel.com); Vercel detects Vite.
2. Add two environment variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
3. Deploy. Every push to `main` redeploys automatically. `vercel.json` rewrites
   all routes to `index.html` so client-side deep links work.

The anon key is safe to expose to the browser; it only grants what the table
grants and RLS policies allow.

## Local development

Run the whole backend locally with the Supabase CLI (needs Docker):

```bash
pnpm install
supabase start                 # local Postgres, Auth, and API in Docker
supabase db reset              # replay migrations + seed into the local database
cp .env.example .env.local     # then paste the API URL + anon key that `supabase start` printed
pnpm dev                       # http://localhost:5173
pnpm build                     # typecheck + production build
```

This project uses [pnpm](https://pnpm.io). Vercel detects it from
`pnpm-lock.yaml` and installs with it automatically.

`supabase db reset` replays every migration from scratch and reloads the seed, so
it is the fastest way to confirm the schema is reproducible.

## CI/CD

- `.github/workflows/ci.yml` runs on pull requests: it typechecks and builds the
  frontend, and replays every migration plus the seed on a throwaway Supabase
  stack, so a broken migration fails the PR.
- `.github/workflows/deploy.yml` applies migrations to the production database on
  merge to `main` (and on demand).
- The frontend deploys separately: Vercel builds and ships it on every push to
  `main` through its GitHub integration.

## Project structure

```
src/
  lib/        supabase client, types, data access (api.ts), CSV, formatting
  auth/       AuthProvider, protected routes, login page
  components/ Layout, Modal, DealFormModal, StageBadge
  pages/      Dashboard, Board, Deals table
supabase/
  migrations/ schema + RLS
  seed.sql    demo data
```

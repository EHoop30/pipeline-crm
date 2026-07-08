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
Migrations live in `supabase/migrations/` and are applied with `supabase db push`
(hosted) or `supabase db reset` (local). The RLS migration also grants table
privileges to the `authenticated` role, so the API works in any environment
without depending on a dashboard setting. Demo data lives in `supabase/seed.sql`.

## Deploy it yourself

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then link
   this repo to your project and push the schema:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>   # ref is in your project URL
   supabase db push                                  # applies schema, RLS, grants
   ```
3. Load the demo data with the connection string from Project Settings > Database:
   ```bash
   psql "<connection-string>" -f supabase/seed.sql
   ```
   (Or paste `supabase/seed.sql` into the dashboard SQL editor. It is demo data,
   not schema, so applying it by hand is fine.)
4. Create the demo login: Authentication > Users > Add user, email
   `demo@pipelinecrm.app`, password `demo1234`, with Auto Confirm on.
5. From Project Settings > API, copy the Project URL and the anon public key.

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
npm install
supabase start                 # local Postgres, Auth, and API in Docker
supabase db reset              # replay migrations + seed into the local database
cp .env.example .env.local     # then paste the API URL + anon key that `supabase start` printed
npm run dev                    # http://localhost:5173
npm run build                  # typecheck + production build
```

`supabase db reset` replays every migration from scratch and reloads the seed, so
it is the fastest way to confirm the schema is reproducible.

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

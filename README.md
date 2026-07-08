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
(demo data). See `supabase/migrations/0002_rls.sql` for the access model and how
to switch from shared-team to per-user data.

## Deploy it yourself

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   fine).
2. In the SQL editor, run `supabase/migrations/0001_schema.sql`, then
   `supabase/migrations/0002_rls.sql`.
3. Create the demo user: Authentication > Users > Add user, email
   `demo@pipelinecrm.app`, password `demo1234`, and confirm the email.
4. In the SQL editor, run `supabase/seed.sql` to load demo companies and deals.
5. From Project Settings > API, copy the Project URL and the anon public key.

### 2. Vercel

1. Push this repo to GitHub and import it at [vercel.com](https://vercel.com).
   Vercel detects Vite automatically.
2. Add two environment variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
3. Deploy. Every push to `main` redeploys automatically. `vercel.json` rewrites
   all routes to `index.html` so client-side deep links work.

The anon key is safe to expose to the browser; it only grants what your RLS
policies allow.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and anon key
npm run dev                  # http://localhost:5173
npm run build                # typecheck + production build
```

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

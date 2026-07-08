-- Pipeline CRM schema.
-- Run this first in the Supabase SQL editor (or via the Supabase CLI).

-- A profile row per auth user, for displaying deal owners by name.
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  industry   text,
  website    text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists deals (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references companies (id) on delete set null,
  title          text not null,
  value_cents    bigint not null default 0,
  stage          text not null default 'lead'
                 check (stage in ('lead', 'qualified', 'proposal', 'won', 'lost')),
  owner_id       uuid references auth.users (id) on delete set null,
  expected_close date,
  notes          text,
  created_by     uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists deals_stage_idx on deals (stage);
create index if not exists deals_company_idx on deals (company_id);

create table if not exists activities (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references deals (id) on delete cascade,
  kind       text not null default 'note'
             check (kind in ('note', 'call', 'email', 'meeting')),
  body       text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists activities_deal_idx on activities (deal_id);

-- Keep deals.updated_at current on every update.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists deals_set_updated_at on deals;
create trigger deals_set_updated_at
  before update on deals
  for each row execute function set_updated_at();

-- Auto-create a profile when a new user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security.
-- Run this second, after 0001_schema.sql.
--
-- Model: a small internal team that shares one book of business. Every
-- authenticated user can read and write all CRM records; anonymous users can
-- do nothing. This is the common "shared team data" model, not per-user
-- isolation. To scope data per user instead, change the `using` clauses to
-- compare auth.uid() against created_by/owner_id.

alter table profiles   enable row level security;
alter table companies  enable row level security;
alter table deals      enable row level security;
alter table activities enable row level security;

-- Profiles: everyone signed in can read names; you may edit only your own.
create policy "profiles are readable by the team"
  on profiles for select to authenticated using (true);

create policy "users update their own profile"
  on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Shared CRM tables: full access for any authenticated team member.
create policy "team reads companies"   on companies  for select to authenticated using (true);
create policy "team writes companies"  on companies  for all    to authenticated using (true) with check (true);

create policy "team reads deals"       on deals      for select to authenticated using (true);
create policy "team writes deals"      on deals      for all    to authenticated using (true) with check (true);

create policy "team reads activities"  on activities for select to authenticated using (true);
create policy "team writes activities" on activities for all    to authenticated using (true) with check (true);

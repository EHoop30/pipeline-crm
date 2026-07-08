-- Demo data for Pipeline CRM.
--
-- Loaded automatically by `supabase db reset` (local) after migrations. For a
-- hosted project, apply it once with psql (see the README). Re-running it
-- resets the demo data to a clean state.
--
-- Rows are left unassigned (owner null); the demo login is a separate auth
-- concern, and the shared-team RLS model shows all rows to any signed-in user.

delete from activities;
delete from deals;
delete from companies;

insert into companies (id, name, industry, website) values
  ('11111111-1111-1111-1111-111111111111', 'Acme Manufacturing', 'Industrial',  'acme.example'),
  ('22222222-2222-2222-2222-222222222222', 'Globex Logistics',   'Logistics',   'globex.example'),
  ('33333333-3333-3333-3333-333333333333', 'Initech Software',   'Software',    'initech.example'),
  ('44444444-4444-4444-4444-444444444444', 'Umbrella Health',    'Healthcare',  'umbrella.example'),
  ('55555555-5555-5555-5555-555555555555', 'Hooli Cloud',        'Technology',  'hooli.example');

insert into deals (id, company_id, title, value_cents, stage, expected_close, notes) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Acme - annual platform license',   4800000, 'proposal',  current_date + 21, 'Sent proposal, awaiting procurement sign-off.'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Globex - fleet tracking rollout',   9200000, 'qualified', current_date + 40, 'Pilot approved for 3 depots.'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Initech - API integration package', 2600000, 'lead',      current_date + 55, 'Inbound from website demo request.'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Umbrella - compliance module',   7100000, 'won',       current_date - 5,  'Closed. Kickoff scheduled.'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Hooli - migration services',     3300000, 'proposal',  current_date + 14, 'Negotiating scope of phase 1.'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Acme - support tier upgrade',     900000, 'qualified', current_date + 30, 'Champion wants premium SLA.'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Globex - onboarding add-on',      450000, 'lead',      current_date + 60, null),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Initech - renewal',              1800000, 'lost',      current_date - 12, 'Chose a competitor on price.'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Hooli - analytics seats',         600000, 'qualified', current_date + 18, null),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Umbrella - data retention review', 1200000,'lead',     current_date + 45, 'Intro call booked.');

insert into activities (deal_id, kind, body) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'call',    'Discovery call with procurement. They need SOC 2 docs attached to the proposal.'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'email',   'Sent proposal PDF and security overview.'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'meeting', 'On-site pilot planning. Agreed on 3 depots for the first phase.'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'note',    'Came in through the website demo form. Mid-market, ~200 employees.');

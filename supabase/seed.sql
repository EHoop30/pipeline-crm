-- Demo data for Pipeline CRM.
--
-- Run this AFTER creating the demo user (Authentication > Add user) with email
-- demo@pipelinecrm.app. Re-running it resets the demo data to a clean state.
-- All rows are owned by the demo user so the live demo looks populated.

do $$
declare
  demo_id uuid;
  acme    uuid := '11111111-1111-1111-1111-111111111111';
  globex  uuid := '22222222-2222-2222-2222-222222222222';
  initech uuid := '33333333-3333-3333-3333-333333333333';
  umbrella uuid := '44444444-4444-4444-4444-444444444444';
  hooli   uuid := '55555555-5555-5555-5555-555555555555';
  d_acme  uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  d_glob  uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  d_init  uuid := 'aaaaaaaa-0000-0000-0000-000000000003';
begin
  select id into demo_id from auth.users where email = 'demo@pipelinecrm.app';
  if demo_id is null then
    raise exception 'Create the demo user (demo@pipelinecrm.app) before seeding.';
  end if;

  delete from activities;
  delete from deals;
  delete from companies;

  insert into companies (id, name, industry, website, created_by) values
    (acme,     'Acme Manufacturing', 'Industrial',  'acme.example',     demo_id),
    (globex,   'Globex Logistics',   'Logistics',   'globex.example',   demo_id),
    (initech,  'Initech Software',   'Software',     'initech.example',  demo_id),
    (umbrella, 'Umbrella Health',    'Healthcare',   'umbrella.example', demo_id),
    (hooli,    'Hooli Cloud',        'Technology',   'hooli.example',    demo_id);

  insert into deals
    (id, company_id, title, value_cents, stage, owner_id, expected_close, notes, created_by) values
    (d_acme, acme,    'Acme - annual platform license',   4800000, 'proposal',  demo_id, current_date + 21, 'Sent proposal, awaiting procurement sign-off.', demo_id),
    (d_glob, globex,  'Globex - fleet tracking rollout',   9200000, 'qualified', demo_id, current_date + 40, 'Pilot approved for 3 depots.',                  demo_id),
    (d_init, initech, 'Initech - API integration package', 2600000, 'lead',      demo_id, current_date + 55, 'Inbound from website demo request.',           demo_id),
    (gen_random_uuid(), umbrella, 'Umbrella - compliance module',   7100000, 'won',       demo_id, current_date - 5,  'Closed. Kickoff scheduled.',            demo_id),
    (gen_random_uuid(), hooli,    'Hooli - migration services',     3300000, 'proposal',  demo_id, current_date + 14, 'Negotiating scope of phase 1.',         demo_id),
    (gen_random_uuid(), acme,     'Acme - support tier upgrade',     900000, 'qualified', demo_id, current_date + 30, 'Champion wants premium SLA.',           demo_id),
    (gen_random_uuid(), globex,   'Globex - onboarding add-on',      450000, 'lead',      demo_id, current_date + 60, null,                                    demo_id),
    (gen_random_uuid(), initech,  'Initech - renewal',              1800000, 'lost',      demo_id, current_date - 12, 'Chose a competitor on price.',          demo_id),
    (gen_random_uuid(), hooli,    'Hooli - analytics seats',         600000, 'qualified', demo_id, current_date + 18, null,                                    demo_id),
    (gen_random_uuid(), umbrella, 'Umbrella - data retention review', 1200000,'lead',     demo_id, current_date + 45, 'Intro call booked.',                    demo_id);

  insert into activities (deal_id, kind, body, created_by) values
    (d_acme, 'call',    'Discovery call with procurement. They need SOC 2 docs attached to the proposal.', demo_id),
    (d_acme, 'email',   'Sent proposal PDF and security overview.',                                       demo_id),
    (d_glob, 'meeting', 'On-site pilot planning. Agreed on 3 depots for the first phase.',                 demo_id),
    (d_init, 'note',    'Came in through the website demo form. Mid-market, ~200 employees.',              demo_id);
end $$;

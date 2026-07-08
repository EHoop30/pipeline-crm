-- Scheduled reset for the public hosted demo.
--
-- The demo is a shared, publicly-loggable workspace, so anyone can edit its
-- data. This schedules an automatic reset every few hours (via pg_cron) so the
-- demo self-heals from edits or vandalism and always looks presentable.
--
-- Run this ONCE against the hosted project (SQL editor or psql). It is not part
-- of the migrations on purpose: pg_cron is a hosted concern and is neither
-- needed nor available in local development or CI. It is safe to re-run.

create extension if not exists pg_cron;

-- Replace any existing schedule so re-running this file is idempotent.
select cron.unschedule('reset-demo-data')
where exists (select 1 from cron.job where jobname = 'reset-demo-data');

-- Reset the demo data at the top of every third hour.
select cron.schedule(
  'reset-demo-data',
  '0 */3 * * *',
  'select public.reset_demo_data()'
);

-- Demo data seed.
--
-- Loaded automatically by `supabase db reset` (local) after migrations, and
-- applied once to a hosted project (see README). The data itself is defined in
-- the reset_demo_data() function (created by a migration), so the seed and the
-- scheduled reset stay in sync from a single source.

select public.reset_demo_data();

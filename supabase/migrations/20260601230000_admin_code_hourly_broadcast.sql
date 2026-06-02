-- Hourly broadcast of the rotating admin access code to the ops Discord
-- channel. We can't use Vercel cron for this because the Hobby plan caps
-- cron jobs to once per day, so we drive it from Postgres via pg_cron +
-- pg_net. The actual code derivation + Discord webhook post still live in
-- the API at /api/admin/code/notify - this migration just schedules an
-- hourly authenticated POST to that endpoint.

-- 1. Required extensions ------------------------------------------------------
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault;

-- 2. Where the cron job will read its secrets from ----------------------------
-- The CRON_SECRET (used as the Bearer token to authenticate to
-- /api/admin/code/notify) and the production base URL are stored in
-- Supabase Vault so they are not committed in plaintext. After applying
-- this migration, run the one-time setup below in the Supabase SQL editor:
--
--   select vault.create_secret(
--     '<your-CRON_SECRET-value>',
--     'amp_admin_cron_secret',
--     'Bearer token used by pg_cron to call /api/admin/code/notify'
--   );
--
--   select vault.create_secret(
--     'https://aminomarket.shop',
--     'amp_admin_base_url',
--     'Origin used by pg_cron when calling the admin notify endpoint'
--   );
--
-- (If you are running against a non-prod environment, change the URL value
-- in the second statement.)

-- 3. The function pg_cron actually invokes -----------------------------------
-- Pulls the secrets out of Vault on every invocation (so rotating the
-- secret in Vault is a one-line change with no migration required) and
-- fires an HTTP POST. Errors are swallowed because pg_cron must keep its
-- schedule even if the Vercel function is briefly unavailable - the next
-- hourly tick will still fire.
create or replace function public.broadcast_admin_access_code()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret  text;
  v_base    text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'amp_admin_cron_secret'
   limit 1;

  select decrypted_secret into v_base
    from vault.decrypted_secrets
   where name = 'amp_admin_base_url'
   limit 1;

  if v_secret is null or v_base is null then
    raise notice 'admin code broadcast skipped: vault secret missing';
    return;
  end if;

  perform net.http_post(
    url     := v_base || '/api/admin/code/notify',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body    := '{}'::jsonb
  );
end;
$$;

revoke all on function public.broadcast_admin_access_code() from public, anon, authenticated;

-- 4. Schedule (idempotent) ---------------------------------------------------
do $$
begin
  if exists (select 1 from cron.job where jobname = 'amp_admin_code_hourly') then
    perform cron.unschedule('amp_admin_code_hourly');
  end if;

  perform cron.schedule(
    'amp_admin_code_hourly',
    '0 * * * *',
    $cmd$ select public.broadcast_admin_access_code(); $cmd$
  );
end
$$;

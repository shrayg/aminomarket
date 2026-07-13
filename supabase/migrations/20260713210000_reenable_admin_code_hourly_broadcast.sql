-- Re-enable hourly Discord admin-code broadcasts (pg_cron + pg_net).
-- Requires vault secrets amp_admin_cron_secret and amp_admin_base_url
-- (created when the original 20260601230000 migration was applied).

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

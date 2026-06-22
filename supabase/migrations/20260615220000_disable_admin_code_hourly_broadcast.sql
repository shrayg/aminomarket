-- Disable hourly Discord admin-code broadcasts (pg_cron + pg_net).
-- The /api/admin/code/notify endpoint remains but is a no-op in application
-- code; this migration removes the scheduled caller.

do $$
begin
  if exists (select 1 from cron.job where jobname = 'amp_admin_code_hourly') then
    perform cron.unschedule('amp_admin_code_hourly');
  end if;
end
$$;

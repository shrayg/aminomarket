-- Disable hourly Discord admin-code broadcasts permanently.
-- Admin auth now uses a static ADMIN_PASSWORD env var (no rotation).

do $$
begin
  if exists (select 1 from cron.job where jobname = 'amp_admin_code_hourly') then
    perform cron.unschedule('amp_admin_code_hourly');
  end if;
end
$$;

create table if not exists public.discord_notification_deliveries (
  delivery_key text primary key,
  created_at timestamptz not null default now()
);

alter table public.discord_notification_deliveries enable row level security;

grant all on table public.discord_notification_deliveries to service_role;

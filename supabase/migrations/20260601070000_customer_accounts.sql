alter table public.orders
  add column if not exists stripe_session_id text unique,
  add column if not exists currency text not null default 'USD',
  add column if not exists checkout_status text not null default 'complete',
  add column if not exists payment_status text not null default 'paid',
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists shipping jsonb,
  add column if not exists billing jsonb,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.app_user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  label text not null default 'Shipping address',
  recipient_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  requested_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders(user_id, created_at desc);
create index if not exists orders_email_created_at_idx
  on public.orders(email, created_at desc);
create index if not exists app_user_addresses_user_id_idx
  on public.app_user_addresses(user_id);
create index if not exists password_reset_requests_email_requested_at_idx
  on public.password_reset_requests(email, requested_at desc);

alter table public.app_user_addresses enable row level security;
alter table public.password_reset_requests enable row level security;

grant all on table public.app_user_addresses to service_role;
grant all on table public.password_reset_requests to service_role;

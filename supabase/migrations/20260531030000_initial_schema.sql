create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price double precision not null,
  category_id uuid references public.categories(id),
  in_stock boolean not null default true,
  is_featured boolean not null default false,
  is_pre_sale boolean not null default false
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id),
  email text not null,
  total double precision not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null,
  price double precision not null
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_sessions (
  id text primary key,
  visitor_id text,
  entry_path text not null,
  source text,
  referrer text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  engaged boolean not null default false,
  page_views integer not null default 0,
  checkout_started boolean not null default false,
  converted boolean not null default false
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.analytics_sessions(id) on delete cascade,
  visitor_id text,
  type text not null,
  path text,
  product_slug text,
  query text,
  source text,
  referrer text,
  value double precision,
  duration_seconds integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fulfillment_records (
  stripe_session_id text primary key,
  status text not null default 'unfulfilled',
  tracking_number text,
  note text,
  updated_at timestamptz not null default now()
);

create index if not exists analytics_sessions_started_at_idx on public.analytics_sessions(started_at);
create index if not exists analytics_events_type_created_at_idx on public.analytics_events(type, created_at);
create index if not exists analytics_events_session_id_idx on public.analytics_events(session_id);

alter table public.app_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.fulfillment_records enable row level security;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

create or replace function public.record_analytics_event(
  p_session_id text,
  p_visitor_id text,
  p_type text,
  p_path text,
  p_product_slug text,
  p_query text,
  p_source text,
  p_referrer text,
  p_value double precision,
  p_duration_seconds integer,
  p_metadata jsonb
) returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.analytics_sessions (
    id,
    visitor_id,
    entry_path,
    source,
    referrer,
    last_seen_at,
    duration_seconds,
    engaged,
    page_views,
    checkout_started,
    converted
  ) values (
    p_session_id,
    p_visitor_id,
    coalesce(p_path, '/'),
    coalesce(p_source, 'direct'),
    p_referrer,
    now(),
    p_duration_seconds,
    p_duration_seconds >= 5,
    case when p_type = 'page_view' then 1 else 0 end,
    p_type = 'checkout_started',
    p_type = 'purchase_return'
  )
  on conflict (id) do update set
    last_seen_at = now(),
    duration_seconds = greatest(analytics_sessions.duration_seconds, excluded.duration_seconds),
    engaged = analytics_sessions.engaged or excluded.engaged,
    page_views = analytics_sessions.page_views + case when p_type = 'page_view' then 1 else 0 end,
    checkout_started = analytics_sessions.checkout_started or excluded.checkout_started,
    converted = analytics_sessions.converted or excluded.converted;

  insert into public.analytics_events (
    session_id,
    visitor_id,
    type,
    path,
    product_slug,
    query,
    source,
    referrer,
    value,
    duration_seconds,
    metadata
  ) values (
    p_session_id,
    p_visitor_id,
    p_type,
    p_path,
    p_product_slug,
    p_query,
    p_source,
    p_referrer,
    p_value,
    p_duration_seconds,
    p_metadata
  );
end;
$$;

revoke execute on function public.record_analytics_event(text, text, text, text, text, text, text, text, double precision, integer, jsonb) from public, anon, authenticated;
grant execute on function public.record_analytics_event(text, text, text, text, text, text, text, text, double precision, integer, jsonb) to service_role;

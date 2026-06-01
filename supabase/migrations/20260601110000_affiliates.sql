-- Affiliate program: any approved customer can earn commission on orders
-- placed using their personal promo code. Promotion is gated on the owner
-- promoting the customer's role from 'customer' to 'affiliate', which auto-
-- generates the code + a Stripe Promotion Code that gives the buyer 10% off.
-- Commission tier scales 25% -> 40% once the affiliate crosses both 50 paid
-- redemptions AND $2,500 of product subtotal processed.
alter table public.app_users
  add column if not exists role text not null default 'customer',
  add column if not exists affiliate_code text,
  add column if not exists affiliate_status text not null default 'none',
  add column if not exists affiliate_promo_code_id text,
  add column if not exists affiliate_coupon_id text;

-- Constrain the role + status enums at the database level so the admin UI
-- (and any future rogue migration) cannot accidentally introduce free-form
-- values that downstream services would have to defensively normalize.
alter table public.app_users drop constraint if exists app_users_role_chk;
alter table public.app_users
  add constraint app_users_role_chk
  check (role in ('customer', 'affiliate', 'admin'));

alter table public.app_users drop constraint if exists app_users_affiliate_status_chk;
alter table public.app_users
  add constraint app_users_affiliate_status_chk
  check (affiliate_status in ('none', 'pending', 'approved', 'denied'));

comment on column public.app_users.role is
  'Account role for permissioning. Allowed: customer (default), affiliate (earns commission on referred orders), admin (operator). Promoted by the admin panel.';
comment on column public.app_users.affiliate_code is
  'Public 6-character A-Z 0-9 code (no 0/O/1/I/L for readability) the affiliate shares with buyers. NULL until the user is promoted. Mirrors the Stripe Promotion Code the same way the same value is used as the promo code.';
comment on column public.app_users.affiliate_status is
  'Application state: none (default), pending (applied, awaiting owner review), approved (promoted), denied (rejected). Owner approval flips role to affiliate AND status to approved atomically via the affiliate service.';
comment on column public.app_users.affiliate_promo_code_id is
  'Stripe Promotion Code ID (promo_*) created on approval. The frontend never uses this directly; persisted so the Stripe webhook can map a redemption back to the affiliate.';
comment on column public.app_users.affiliate_coupon_id is
  'Stripe Coupon ID (10% off, duration:forever) underlying the Promotion Code. Persisted for completeness so the owner can audit / archive the coupon if the affiliate is offboarded.';

create unique index if not exists app_users_affiliate_code_uidx
  on public.app_users (affiliate_code)
  where affiliate_code is not null;

-- Ledger of every Stripe Checkout session that redeemed an affiliate's
-- promotion code. Inserted by the Stripe webhook on completed sessions.
-- Idempotent on stripe_session_id so webhook retries cannot double-count.
create table if not exists public.affiliate_redemptions (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references public.app_users(id) on delete cascade,
  stripe_session_id text not null unique,
  amount_subtotal_cents bigint not null,
  amount_shipping_cents bigint not null default 0,
  amount_total_cents bigint not null,
  created_at timestamptz not null default now()
);

comment on table public.affiliate_redemptions is
  'Each row is one Stripe Checkout session paid using an affiliate''s promo code. Aggregated by the affiliate service to compute total uses, total processed, and estimated commission.';
comment on column public.affiliate_redemptions.affiliate_user_id is
  'app_users.id of the affiliate who owns the redeemed promo code (looked up via app_users.affiliate_promo_code_id).';
comment on column public.affiliate_redemptions.stripe_session_id is
  'Source Stripe Checkout Session id (cs_*). Unique so webhook retries are idempotent.';
comment on column public.affiliate_redemptions.amount_subtotal_cents is
  'Stripe session amount_subtotal in cents at the time of redemption (pre-shipping, pre-discount). Drives the 40% tier $2,500 threshold and the conservative profit estimate.';
comment on column public.affiliate_redemptions.amount_shipping_cents is
  'Shipping cost in cents charged to the customer. Subtracted from estimated profit because shipping is owner-paid (not margin).';
comment on column public.affiliate_redemptions.amount_total_cents is
  'Stripe session amount_total in cents (post-shipping, post-discount). Used for owner-side reconciliation of Stripe fees vs. estimated commission.';

create index if not exists affiliate_redemptions_affiliate_user_id_idx
  on public.affiliate_redemptions (affiliate_user_id, created_at desc);

alter table public.affiliate_redemptions enable row level security;

grant all on table public.affiliate_redemptions to service_role;

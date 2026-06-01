-- Loyalty rewards: automatically grant a permanent 10% off coupon to any
-- account whose lifetime paid spend crosses $300. Discount is attached to
-- the customer's Stripe Customer record so Stripe auto-applies it on every
-- future Checkout Session without the customer doing anything.
alter table public.app_users
  add column if not exists stripe_customer_id text,
  add column if not exists lifetime_spend_cents bigint not null default 0,
  add column if not exists loyalty_coupon_id text;

comment on column public.app_users.stripe_customer_id is
  'Stripe Customer ID for this account. NULL until the first checkout session is created (lazily provisioned). Used to attach a persistent loyalty coupon.';
comment on column public.app_users.lifetime_spend_cents is
  'Cumulative cents paid across all completed orders for this account. Incremented from the Stripe webhook on checkout.session.completed (payment_status=paid). Drives the $300 loyalty threshold.';
comment on column public.app_users.loyalty_coupon_id is
  'Stripe Coupon ID granted to this account once their lifetime spend crosses the loyalty threshold. NULL until unlocked. Presence indicates the coupon has been created AND attached to the Stripe Customer.';

create unique index if not exists app_users_stripe_customer_id_uidx
  on public.app_users (stripe_customer_id)
  where stripe_customer_id is not null;

-- Atomic, race-safe increment used from the Stripe webhook. Returning the
-- new total lets the caller decide whether the loyalty threshold has been
-- crossed without a second round trip.
create or replace function public.increment_lifetime_spend(
  p_user_id uuid,
  p_amount_cents bigint
) returns bigint
language plpgsql
set search_path = public
as $$
declare
  new_total bigint;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then
    select lifetime_spend_cents into new_total from public.app_users where id = p_user_id;
    return new_total;
  end if;

  update public.app_users
    set lifetime_spend_cents = lifetime_spend_cents + p_amount_cents
    where id = p_user_id
    returning lifetime_spend_cents into new_total;

  return new_total;
end;
$$;

revoke execute on function public.increment_lifetime_spend(uuid, bigint) from public, anon, authenticated;
grant execute on function public.increment_lifetime_spend(uuid, bigint) to service_role;

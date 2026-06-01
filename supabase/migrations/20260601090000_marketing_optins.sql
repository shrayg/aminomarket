-- Adds marketing-channel opt-in flags collected at account creation per
-- business policy (email + SMS, pre-checked, user-uncheckable). Defaults
-- mirror the storefront default so existing rows are migrated as opted-in
-- (legacy users had only one implicit channel — email — when they signed up).
alter table public.app_users
  add column if not exists marketing_email_opt_in boolean not null default true,
  add column if not exists marketing_sms_opt_in boolean not null default true,
  add column if not exists phone text;

comment on column public.app_users.marketing_email_opt_in is
  'Email marketing (discounts, promos, launches). Transactional mail is always sent.';
comment on column public.app_users.marketing_sms_opt_in is
  'SMS marketing (discounts, promos). Reply STOP to opt out per CTIA.';
comment on column public.app_users.phone is
  'Optional phone number for SMS marketing. Nullable; collected lazily.';

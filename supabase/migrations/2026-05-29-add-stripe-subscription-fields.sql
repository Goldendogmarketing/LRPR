-- LRPR migration: Stripe subscription tracking on profiles
-- 2026-05-29
--
-- Each paid tier (fsbo / agent / investor / vendor) is a monthly Stripe
-- subscription. We track the Stripe customer + subscription on the profile
-- so the webhook can flip payment_complete and the /account page can open
-- the billing portal. payment_required / payment_complete already exist.
--
-- All idempotent — safe to re-run.

alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists stripe_subscription_id text;
-- Mirrors Stripe's subscription.status: active, trialing, past_due,
-- canceled, incomplete, etc. Null until the first checkout completes.
alter table profiles add column if not exists subscription_status text;

create index if not exists profiles_stripe_customer_idx
  on profiles (stripe_customer_id);

-- 2026-05-28: Add tier-tracking columns to profiles.
-- Safe to re-run (uses IF NOT EXISTS).
alter table profiles add column if not exists tier_selected_at timestamptz;
alter table profiles add column if not exists payment_required boolean not null default false;
alter table profiles add column if not exists payment_complete boolean not null default false;

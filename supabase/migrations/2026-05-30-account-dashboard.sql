-- Account dashboard tables: vendor favorites, personal notes, and saved tools.
-- Safe to re-run (IF NOT EXISTS everywhere).
--
-- Apply with:
--   node --env-file=.env.local scripts/run-migration.mjs supabase/migrations/2026-05-30-account-dashboard.sql

-- Vendors a public/free user has saved. vendor_id references a
-- service_provider_profiles row; name/category are snapshotted so the
-- favorites list still renders if the provider row is later removed.
create table if not exists vendor_favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid not null,
  vendor_name text,
  vendor_category text,
  created_at timestamptz not null default now(),
  unique (profile_id, vendor_id)
);

-- Free-form personal notes shown on the account notes page.
create table if not exists account_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tools/calculators/resources a user has pinned to their dashboard.
-- tool_key matches an entry in src/data/tools.ts (validated app-side).
create table if not exists saved_tools (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  tool_key text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, tool_key)
);

create index if not exists vendor_favorites_profile_idx on vendor_favorites(profile_id, created_at desc);
create index if not exists account_notes_profile_idx on account_notes(profile_id, updated_at desc);
create index if not exists saved_tools_profile_idx on saved_tools(profile_id, created_at desc);

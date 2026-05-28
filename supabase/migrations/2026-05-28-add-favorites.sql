-- 2026-05-28: Saved listings (favorites) for any signed-in user.
-- One row per (profile, listing). Listings are referenced by slug
-- because the listings catalog currently lives in src/data/site.ts —
-- when we move listings into a real DB table we'll add a FK.

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  listing_slug text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, listing_slug)
);

create index if not exists favorites_profile_idx
  on favorites(profile_id, created_at desc);

-- LRPR migration: publish pipeline + geocoding plumbing
-- 2026-05-29
--
-- Two related additions:
--   1. Geocoding (Task 6): store the lat/lng result of geocoding a
--      submission's address so it's available at publish time and for
--      the listing map. submissions already has city/county/state/
--      postal_code/geocoding_status; this adds the coordinates + a
--      timestamp of when geocoding last ran.
--   2. Publish pipeline (Task 2): published_listings.listing_data holds
--      the full immersive-ready Listing object (address, price, beds,
--      features, photos, listedBy, etc.) as a single jsonb blob so the
--      listings source can hydrate a Listing without a wide column list.
--
-- All statements are idempotent — safe to re-run.

-- 1. Geocoding coordinates on submissions
alter table submissions add column if not exists latitude numeric;
alter table submissions add column if not exists longitude numeric;
alter table submissions add column if not exists geocoded_at timestamptz;

-- 2. Full Listing payload on published_listings
alter table published_listings
  add column if not exists listing_data jsonb not null default '{}'::jsonb;

-- Helpful indexes for the public browse pages (filter by type/status that
-- live inside listing_data) and for slug lookups (slug already unique, but
-- be explicit for the join from listings-source).
create index if not exists published_listings_slug_idx
  on published_listings (slug);
create index if not exists published_listings_type_idx
  on published_listings ((listing_data->>'type'));
create index if not exists published_listings_status_idx
  on published_listings ((listing_data->>'status'));

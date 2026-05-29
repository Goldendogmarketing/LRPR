-- LRPR migration: immersive listing template fields + photo storage
-- 2026-05-28
--
-- Adds the data plumbing for two things:
--   1. Paid users (fsbo / agent / investor / vendor) customizing the
--      agent/contact block that appears in the immersive listing nav,
--      CTA, and footer.
--   2. Photo uploads carried from /submit-listing through admin review
--      into the published immersive listing page.
--
-- All ALTER TABLE statements are idempotent (ADD COLUMN IF NOT EXISTS)
-- so this migration is safe to re-run on existing deployments.

-- ─────────────────────────────────────────────────────────────────────
-- 1. Profile customization columns
-- ─────────────────────────────────────────────────────────────────────
-- display_name overrides profiles.full_name for public-facing surfaces
-- (immersive nav/CTA/footer). brokerage / phone / tagline / headshot
-- populate the agent block. accent_color tints the gold/highlight in
-- the immersive template.

alter table profiles add column if not exists display_name text;
alter table profiles add column if not exists brokerage text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists tagline text;
alter table profiles add column if not exists headshot_url text;
alter table profiles add column if not exists accent_color text;

-- Optional: store the brand initials override (defaults to first letter
-- of display_name in the app code).
alter table profiles add column if not exists brand_initials text;

-- Paid "immersive presentation" upgrade flag. Default false so existing
-- profiles stay on the classic listing layout.
alter table profiles add column if not exists immersive_enabled boolean not null default false;

-- A guard rail: accent_color must be a 7-char hex string starting with
-- #. We use a CHECK rather than a domain to keep null permitted.
alter table profiles
  drop constraint if exists profiles_accent_color_hex_chk;
alter table profiles
  add constraint profiles_accent_color_hex_chk
  check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$');

-- ─────────────────────────────────────────────────────────────────────
-- 2. Submission + published-listing photo arrays + listedBy snapshot
-- ─────────────────────────────────────────────────────────────────────
-- photos: jsonb array of { url, ordering, alt }.
-- listed_by: jsonb snapshot of the agent block at submission time so
-- changing your profile name later doesn't silently rewrite old
-- published listings.

alter table submissions add column if not exists photos jsonb not null default '[]'::jsonb;
alter table submissions add column if not exists listed_by jsonb not null default '{}'::jsonb;

alter table published_listings add column if not exists photos jsonb not null default '[]'::jsonb;
alter table published_listings add column if not exists listed_by jsonb not null default '{}'::jsonb;

-- Quick lookup of "all listings owned by profile X" for the future
-- /account dashboard.
create index if not exists published_listings_listed_by_profile_idx
  on published_listings ((listed_by->>'profileId'));

-- ─────────────────────────────────────────────────────────────────────
-- 3. Storage buckets — listing-photos + profile-assets
-- ─────────────────────────────────────────────────────────────────────
-- Both buckets are public-read so the immersive page can fetch images
-- without signed URLs. Writes flow through server actions using the
-- service role key, which bypasses RLS, so we only need the read policy.

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do update set public = excluded.public;

-- Public read policies. These do nothing for the service-role client
-- (which bypasses RLS) but make the bucket browsable from the public
-- URLs the app renders into <img src="...">.
drop policy if exists "Public read listing photos" on storage.objects;
create policy "Public read listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "Public read profile assets" on storage.objects;
create policy "Public read profile assets"
  on storage.objects for select
  using (bucket_id = 'profile-assets');

-- Service role (used by all our server actions) can write. We intentionally
-- do NOT permit anon writes — every upload must go through a server action
-- that authenticates with Clerk first.
drop policy if exists "Service role write listing photos" on storage.objects;
create policy "Service role write listing photos"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.role() = 'service_role');

drop policy if exists "Service role write profile assets" on storage.objects;
create policy "Service role write profile assets"
  on storage.objects for insert
  with check (bucket_id = 'profile-assets' and auth.role() = 'service_role');

drop policy if exists "Service role delete listing photos" on storage.objects;
create policy "Service role delete listing photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.role() = 'service_role');

drop policy if exists "Service role delete profile assets" on storage.objects;
create policy "Service role delete profile assets"
  on storage.objects for delete
  using (bucket_id = 'profile-assets' and auth.role() = 'service_role');

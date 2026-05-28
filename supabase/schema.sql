-- LRPR Supabase/Postgres schema scaffold
-- Run in Supabase SQL editor after the project is created.
-- Keep auth identities sourced from Clerk; do not store provider secrets here.

create extension if not exists pgcrypto;

create type submission_type as enum (
  'residential-sale',
  'land-listing',
  'rental-listing'
);

create type submission_status as enum (
  'draft',
  'account_pending',
  'payment_pending',
  'pending_review',
  'changes_requested',
  'approved',
  'published',
  'rejected'
);

create type review_decision as enum ('approved', 'rejected', 'changes_requested');

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  role text not null default 'free',
  account_validated boolean not null default false,
  tier_selected_at timestamptz,
  payment_required boolean not null default false,
  payment_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent column adds for existing deployments — safe to re-run.
alter table profiles add column if not exists tier_selected_at timestamptz;
alter table profiles add column if not exists payment_required boolean not null default false;
alter table profiles add column if not exists payment_complete boolean not null default false;

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_profile_id uuid references profiles(id) on delete set null,
  submission_type submission_type not null,
  status submission_status not null default 'account_pending',
  source_type text not null,
  listing_status text,
  property_type text,
  contact_name text,
  contact_email text,
  contact_phone text,
  address_line text,
  city text,
  county text,
  state text not null default 'FL',
  postal_code text,
  price_or_rent text,
  beds numeric,
  baths numeric,
  acreage numeric,
  notes text,
  permission_confirmed boolean not null default false,
  account_validated boolean not null default false,
  payment_required boolean not null default true,
  payment_complete boolean not null default false,
  admin_approved boolean not null default false,
  geocoding_status text not null default 'not_started',
  enrichment_status text not null default 'not_started',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  reviewer_profile_id uuid references profiles(id) on delete set null,
  decision review_decision not null,
  notes text,
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists submission_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  actor_profile_id uuid references profiles(id) on delete set null,
  event_type text not null,
  from_status submission_status,
  to_status submission_status,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists published_listings (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid unique references submissions(id) on delete set null,
  slug text unique not null,
  title text not null,
  public_status text not null,
  city text not null,
  county text not null,
  latitude numeric,
  longitude numeric,
  public_data jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_provider_profiles (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text not null,
  city text,
  county text,
  contact_email text,
  contact_phone text,
  website_url text,
  payment_required boolean not null default true,
  payment_complete boolean not null default false,
  admin_approved boolean not null default false,
  verified boolean not null default false,
  sponsored boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists local_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  resource_type text not null,
  city text,
  county text,
  official_url text,
  source_name text,
  notes text,
  admin_approved boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  listing_slug text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, listing_slug)
);

create table if not exists notification_outbox (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  recipient_email text not null,
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on submissions(status);
create index if not exists submissions_type_idx on submissions(submission_type);
create index if not exists submissions_city_county_idx on submissions(city, county);
create index if not exists submission_events_submission_idx on submission_events(submission_id, created_at desc);
create index if not exists notification_outbox_status_idx on notification_outbox(status, created_at);
create index if not exists service_provider_profiles_category_idx on service_provider_profiles(category, city, county);
create index if not exists local_resources_type_idx on local_resources(resource_type, city, county);
create index if not exists favorites_profile_idx on favorites(profile_id, created_at desc);

-- Publish eligibility view for admin queue.
create or replace view submission_publish_gates as
select
  id as submission_id,
  account_validated,
  payment_required,
  payment_complete,
  admin_approved,
  permission_confirmed,
  (account_validated and (not payment_required or payment_complete) and admin_approved and permission_confirmed) as publish_ready
from submissions;

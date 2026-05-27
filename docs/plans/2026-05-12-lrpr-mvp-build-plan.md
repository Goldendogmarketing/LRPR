# LRPR MVP Build Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ship a clean Lake Region Property Resource MVP skeleton that accepts only public property submissions for residential sales, land/lots, and rentals while keeping service providers and local resources admin-managed.

**Architecture:** Keep the current Next.js 16 App Router site as a map-first local property/resource portal. The public `/submit-listing` page becomes a focused property intake surface. Service-provider profiles and local resources move behind admin-only scaffolds so LRPR controls paywalled vendor placement and official local data quality.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Node `node:test`, Supabase/Postgres schema scaffold, future Clerk/Supabase Auth, Stripe, and Resend.

---

## Product scope locked in this sprint

### Public submission lanes

Only these are public-facing submission options:

1. **Residential property for sale**
   - Owners or licensed agents.
   - Requires permission/source verification.
   - No auto-publish.

2. **Land / lot listing**
   - Owners, agents, and land sellers.
   - Parcel/county context should be queued for enrichment.
   - No auto-publish.

3. **Rental listing**
   - Landlords and property managers.
   - Requires availability, lease terms, permission/manager verification.
   - No auto-publish.

### Admin-managed content

1. **Service providers**
   - Admin uploads/creates profiles.
   - Paywall/paid placement basis.
   - Admin approval required before publishing.
   - Not available from the public property submission form.

2. **Local resources**
   - Admin-added data.
   - Official/city/county/utility/permit/school/park/lake/resource links.
   - No public resource submission form in MVP.

---

## MVP pages

### Public

- `/` — Map-first homepage with local search positioning.
- `/for-sale` — Sale inventory/category page.
- `/for-rent` — Rental inventory/category page.
- `/submit-listing` — Public property intake for residential sale, land, rental only.
- `/listings/[slug]` — Listing detail page.
- `/cities/[slug]` — City SEO/resource page.
- `/counties/[slug]` — County SEO/resource page.
- `/resources` — Public local resources directory.
- `/service-pros` — Public service-provider marketplace directory.
- `/data-sources` — Public-data source transparency page.

### Admin scaffold

- `/admin` — Admin queue scaffold for property submissions.
- `/admin/service-providers` — Admin-only service-provider profile/paywall scaffold.
- `/admin/resources` — Admin-only local resource curation scaffold.

---

## Data model direction

### `submissions`

Public property submissions only:

- `residential-sale`
- `land-listing`
- `rental-listing`

Core fields:

- submitter profile/account
- source type: owner, agent, property-manager
- listing status: active or pending
- address/city/county/state/ZIP
- property type
- price/rent
- beds/baths/acreage/notes
- account/payment/admin/permission gates
- geocoding/enrichment status

### `service_provider_profiles`

Admin-managed profile records:

- business name
- category
- city/county/service area
- contact details
- payment required/complete
- admin approved
- verified/sponsored
- published timestamp

### `local_resources`

Admin-curated resource records:

- title
- resource type
- city/county
- official URL/source name
- notes
- admin approved
- published timestamp

---

## Build order

### Task 1: Freeze MVP scope in tests

**Objective:** Make tests assert that public listing intake only includes residential sale, land, and rental.

**Files:**

- Modify: `tests/listing-intake.test.mjs`
- Modify: `scripts/lib/listing-intake.mjs`
- Create: `tests/admin-content.test.mjs`
- Create: `scripts/lib/admin-content.mjs`

**Verification:**

```bash
npm test
```

Expected: tests pass and reject service-provider/local-resource as public submission lanes.

### Task 2: Refocus public submit page

**Objective:** Update `/submit-listing` copy and form options around the three public property lanes only.

**Files:**

- Modify: `src/app/submit-listing/page.tsx`
- Modify: `src/lib/submission-pipeline.ts`
- Modify: `scripts/lib/submission-pipeline.mjs`
- Modify: `tests/submission-pipeline.test.mjs`

**Verification:**

```bash
npm test
npm run lint
```

Expected: property submissions save as provider-ready records; checkout is not required for public property MVP lanes.

### Task 3: Add admin-managed content skeletons

**Objective:** Create placeholders for admin-managed service-provider and local resource workflows.

**Files:**

- Create: `src/app/admin/service-providers/page.tsx`
- Create: `src/app/admin/resources/page.tsx`
- Modify: `src/app/admin/page.tsx`

**Verification:**

```bash
npm run build
```

Expected: routes compile and are linked from `/admin`.

### Task 4: Align Supabase schema scaffold

**Objective:** Keep database scaffold aligned with product scope.

**Files:**

- Modify: `supabase/schema.sql`

**Verification:**

- `submission_type` enum includes only `residential-sale`, `land-listing`, `rental-listing`.
- `service_provider_profiles` is independent/admin-managed.
- `local_resources` exists for admin-curated data.

### Task 5: Next implementation sprint

**Objective:** Move from static/provider-ready skeleton to working persistence.

**Next files to create/modify:**

- Supabase client/server helpers
- Protected admin routes
- Submission create/read actions
- Admin decision actions backed by database
- Resend notification actions
- Optional Clerk or Supabase Auth integration

**Recommended next step after this sprint:** Wire Supabase tables and admin list/read views before adding Stripe, because property intake and admin review need persistence first.

---

## Acceptance criteria

- Public submit page shows only residential property for sale, land/lot, and rental.
- Service providers are clearly admin-uploaded/paywalled/admin-approved.
- Local resources are clearly admin-added data.
- Admin has route skeletons for service providers and resources.
- Tests pass.
- Lint passes.
- Build passes.

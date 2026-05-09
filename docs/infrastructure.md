# LRPR Infrastructure Blueprint

This blueprint keeps the project shippable while Branden is away from API dashboards. It defines the production workflow without requiring live secrets yet.

## Recommended stack

- **Auth/account validation:** Clerk
- **Database:** Supabase Postgres
- **Payments:** Stripe Checkout + Stripe webhooks
- **Email:** Resend
- **Maps/geocoding:** Google Maps/Geocoding later, env-only keys
- **Hosting:** Vercel

## Core workflow

1. Visitor views submission options publicly.
2. Visitor creates/signs into a validated account before saving.
3. User selects submission type.
4. If paid, Stripe checkout creates payment record.
5. Submission enters admin queue.
6. Admin reviews permission, source, photos, facts, and data enrichment.
7. Admin approves/rejects/requests changes.
8. Approved submission can publish to listing/vendor/category/city/county pages.
9. Resend sends notifications at key state changes.

## Submission statuses

- `draft`
- `account_pending`
- `payment_pending`
- `pending_review`
- `changes_requested`
- `approved`
- `published`
- `rejected`

## Tables

- `profiles`: account metadata synced from Clerk.
- `submissions`: listing/vendor/archive submission intake records.
- `submission_events`: audit trail for every status/admin/payment event.
- `payments`: Stripe checkout/session/payment state.
- `admin_reviews`: review decisions, notes, checklist results.
- `published_listings`: approved public listing records.
- `service_provider_profiles`: approved vendor/service-pro records.
- `notification_outbox`: email jobs and status.

## Publish gates

A submission can publish only when:

- account is validated
- payment is complete or waived/not required
- admin approval is recorded
- permission/source quality is verified
- publishable content/photos are safe

## Environment variables

See `.env.example`. Never commit real secrets.

## Live integration checklist

When the external dashboards are available, add these values to `.env.local` only:

### Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. First live write target: `submissions`.
5. First live read target: admin queue filtering `pending_review`, `payment_pending`, and `changes_requested`.

### Clerk

1. Create Clerk app.
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. Protect `/submit-listing` after submission type selection.
4. Protect `/admin` with admin/reviewer roles.

### Stripe

1. Create products/prices for standard sale, featured sale, rental, and vendor/service-pro profile.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the `STRIPE_PRICE_*` values.
3. Webhook should update `payments` and move paid submissions to `pending_review`.

### Resend

1. Verify sender domain/email.
2. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL`.
3. Send admin email on `submission.created`.
4. Send submitter email on `changes_requested`, `approved`, and `published`.

### Google Maps later

1. Add Maps JS key and server geocoding key.
2. Geocode approved addresses.
3. Save lat/lng to `published_listings`.
4. Use public-data enrichment for flood/parcel/census context.

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

## Next implementation steps

1. Install/configure Clerk.
2. Create Supabase project and run `supabase/schema.sql`.
3. Install/configure Stripe and webhook route.
4. Install/configure Resend and notification templates.
5. Replace static admin dashboard with database-backed server components.
6. Add protected route middleware for `/admin` and submission save actions.

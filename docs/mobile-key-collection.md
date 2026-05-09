# LRPR Mobile Key Collection Guide

Use this when Branden is away from the computer and wants to collect the minimum credentials needed to turn LRPR integrations live.

> Safety: send keys only in a private secure channel. If a dashboard shows a secret once, copy it to a secure note/password manager first. Never paste keys into public chats or commit them to Git.

## Priority order from phone

1. Supabase — database first.
2. Resend — email notifications second.
3. Clerk — account validation/route protection third.
4. Stripe — paid submissions fourth.
5. Google Maps — map/geocoding later.

## 1. Supabase

Mobile browser: https://supabase.com/dashboard

Collect:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Where to look:

1. Open/create the LRPR project.
2. Go to Project Settings → API.
3. Copy Project URL.
4. Copy anon/public key.
5. Copy service_role key. Treat this as highly sensitive.

Also needed later:

- Run `supabase/schema.sql` from a computer or the SQL editor if the mobile browser is usable.

## 2. Resend

Mobile browser: https://resend.com/api-keys

Collect:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`

Notes:

- If domain verification is annoying on mobile, use a verified sender/domain later from computer.
- `ADMIN_NOTIFICATION_EMAIL` can be Branden's preferred inbox for new submission alerts.

## 3. Clerk

Mobile browser: https://dashboard.clerk.com

Collect:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Where to look:

1. Open/create LRPR app.
2. Go to API Keys.
3. Copy publishable key.
4. Copy secret key. Treat as sensitive.

## 4. Stripe

Mobile browser: https://dashboard.stripe.com

Collect:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` later after webhook endpoint exists.
- `STRIPE_PRICE_STANDARD_LISTING`
- `STRIPE_PRICE_FEATURED_LISTING`
- `STRIPE_PRICE_RENTAL_LISTING`
- `STRIPE_PRICE_VENDOR_PROFILE`

Phone shortcut:

- If product/price creation is too clunky on mobile, just get `STRIPE_SECRET_KEY` now and create prices later from desktop.

Suggested first products:

- Standard sale listing
- Featured sale listing
- Rental listing
- Vendor / Service Pro profile

## 5. Google Maps later

Mobile browser: https://console.cloud.google.com/google/maps-apis

Collect:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_MAPS_GEOCODING_API_KEY`

Phone caveat:

- Google Cloud API setup and restrictions are often painful on mobile. This can wait. LRPR can keep shipping without maps keys.

## How to send keys

Preferred format:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
```

Do not include keys you cannot access yet. Partial keys are useful.

## Local readiness check

After keys are added to `.env.local`, run:

```bash
npm run check:env
```

This prints which integration groups are ready without exposing secret values.

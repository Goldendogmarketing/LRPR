# Lake Region Property Resource

Lake Region Property Resource is a local Florida Lake Region property and resource portal for Keystone Heights, Starke, Melrose, Hawthorne, Interlachen, Florahome, Hampton, and the surrounding Clay, Bradford, Putnam, and Alachua county areas.

## MVP scope

Public submission intake is limited to:

- Residential property for sale
- Land / lot listings
- Rental listings

Admin-managed content:

- Service-provider profiles are uploaded/managed by admin on a paid/paywall basis and require admin approval before publishing.
- Local resources are added/curated by admin as official/local data records.

## Routes

- `/` — map-first local portal homepage
- `/submit-listing` — public property intake for sale/land/rental only
- `/admin` — admin queue scaffold
- `/admin/service-providers` — admin-managed service-provider/paywall scaffold
- `/admin/resources` — admin-managed local-resource scaffold
- `/for-sale`, `/for-rent`, `/resources`, `/service-pros`, `/data-sources`
- `/cities/[slug]`, `/counties/[slug]`, `/listings/[slug]`

## Development

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

Open http://localhost:3000.

## Planning docs

- `docs/plans/2026-05-12-lrpr-mvp-build-plan.md` — current scoped MVP plan
- `docs/plans/2026-05-09-listing-intake.md` — earlier listing-intake scaffold notes
- `docs/infrastructure.md` — provider/environment scaffold

## Database scaffold

See `supabase/schema.sql` for the current Supabase/Postgres schema direction.

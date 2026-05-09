# LRPR Growth-Driven SEO Architecture

## Goal

Keep Lake Region Property Resource flat, crawlable, and locally relevant. A user or search crawler should reach every important destination in fewer than three clicks.

## Current architecture

- `/` — homepage and internal link hub
- `/for-sale` — sale inventory and sale categories
- `/for-rent` — rental inventory and rental categories
- `/resources` — utilities, municipal, county, schools, emergency, permit/zoning contacts
- `/service-pros` — vendors for real-estate work
- `/cities/[slug]` — city-level hubs, starting with Devils Lake
- `/counties/[slug]` — county-level hubs, starting with Ramsey County
- `/listings/[slug]` — address-level property record pages
- `/sitemap.xml` — generated sitemap for static, city, county, and listing routes
- `/robots.txt` — crawler rules pointing to sitemap

## Internal linking model

Each page should link sideways and upward:

- Listing pages link to city, county, type, map, and related local records.
- City pages link to for-sale, for-rent, resources, service pros, county, and listings.
- County pages link to cities, resources, service pros, and listings.
- Homepage links directly to major listing paths, cities, counties, resources, service pros, and categories.

## Google Maps / coordinate model

Each listing record stores:

- `latitude`
- `longitude`
- full address parts
- city
- county
- state
- postal code

Listing detail pages output Schema.org structured data with `PostalAddress` and `GeoCoordinates`.

Use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for browser map embeds.
Use private `GOOGLE_MAPS_GEOCODING_API_KEY` server-side to convert real addresses into coordinates when importing or creating listings.

## Important note

The current seed listing addresses are demo records. Before launch, replace demo data with real approved listing data and geocode each real address through Google Geocoding API or an approved source.

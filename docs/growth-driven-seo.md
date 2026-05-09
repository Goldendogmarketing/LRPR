# LRPR Growth-Driven SEO Architecture

## Correct region

Lake Region Property Resource is focused on the Florida Lake Region around:

- Keystone Heights
- Starke
- Melrose
- Hawthorne
- Interlachen
- Florahome
- Hampton

Primary county coverage:

- Clay County
- Bradford County
- Putnam County
- Alachua County

## Goal

Keep Lake Region Property Resource flat, crawlable, and locally useful. A user or search crawler should reach every important destination in fewer than three clicks, while each page gets unique sourced content instead of repeated template copy.

## Current architecture

- `/` — homepage and internal link hub
- `/for-sale` — sale inventory and sale categories
- `/for-rent` — rental inventory and rental categories
- `/resources` — utilities, municipal, county, schools, emergency, flood-map, parks/lakes, permit/zoning contacts
- `/service-pros` — vendors for real-estate work
- `/data-sources` — official dataset registry for enrichment transparency and implementation planning
- `/cities/[slug]` — city/community-level hubs
- `/counties/[slug]` — county-level hubs
- `/listings/[slug]` — address-level property record pages
- `/sitemap.xml` — generated sitemap for static, city, county, and listing routes
- `/robots.txt` — crawler rules pointing to sitemap

## Internal linking model

Each page should link sideways and upward:

- Listing pages link to city, county, type, map, datasets, and related local records.
- City pages link to for-sale, for-rent, resources, service pros, counties, datasets, and listings.
- County pages link to cities, resources, service pros, official county site, datasets, and listings.
- Homepage links directly to major listing paths, cities, counties, resources, service pros, and categories.
- Data source cards link to official sources and explain how each dataset adds unique local value.

## Thin-content protection strategy

Do not mass-generate near-identical city pages. Each local page should have unique data blocks from official or credible sources:

- Census/ACS demographics and housing context
- Census geocoder GEOIDs for listings
- County/cadastral parcel context
- FEMA flood-zone context
- Florida DEP/SJRWMD/SRWMD lake, water, wetlands, parks, and environmental data
- NCES schools/district data
- FDOT roads, traffic counts, and commute corridors
- NWS forecast/alerts by city coordinate
- Municipal/county official contacts
- Sunbiz-assisted vendor validation, without implying endorsement

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

## Dataset registry

Dataset sources live in:

- `src/data/datasets.ts`

Page-ready summaries and future ingestion hooks live in:

- `src/lib/dataset-enrichment.ts`

The dataset registry should eventually feed a scheduled ingestion pipeline that writes normalized summaries to the database, rather than calling external APIs during page render.

## Important note

The current listing addresses are demo records. Before launch, replace demo data with real approved listing data and geocode each real address through Google Geocoding API or an approved source. Do not scrape copyrighted MLS/Zillow/Realtor.com listing content.

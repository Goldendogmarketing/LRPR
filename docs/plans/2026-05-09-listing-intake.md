# Listing Intake Implementation Plan

> **For Hermes:** Use TDD for validation/helpers and keep the first version local/static until persistence is chosen.

**Goal:** Add the first real-listing intake surface so LRPR can collect owner, agent, and property-manager submissions without needing Google Maps API keys yet.

**Architecture:** Start with a static App Router page at `/submit-listing` and a reusable intake option model. The page explains LRPR accepts approved/verified submissions, not scraped portal feeds. Later, wire the form to Supabase/Postgres, email notifications, geocoding, and approval workflow.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind, Node test runner for helper tests.

---

### Task 1: Add intake model tests

**Objective:** Prove the listing-intake model includes the required submitter types, listing statuses, and review checklist.

**Files:**
- Create: `tests/listing-intake.test.mjs`
- Create: `scripts/lib/listing-intake.mjs`

**Verification:**
- Run `npm test`
- Expected initial RED failure until helper exists.

### Task 2: Add helper/model

**Objective:** Create a small JS helper that defines intake options and can be tested outside Next.

**Files:**
- Create: `scripts/lib/listing-intake.mjs`

**Verification:**
- Run `npm test`
- Expected PASS.

### Task 3: Add `/submit-listing` page

**Objective:** Build a polished form page for owners, agents, and property managers.

**Files:**
- Create: `src/app/submit-listing/page.tsx`

**Sections:**
- Hero: “Submit a Lake Region property”
- Trust note: “Approved records only — no scraped Zillow/MLS feeds”
- Contact/source fields
- Property basics fields
- Verification checklist
- What happens next timeline

### Task 4: Connect CTAs

**Objective:** Link homepage/header to `/submit-listing`.

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/app/page.tsx`

### Task 5: Verify and commit

**Commands:**
```bash
npm test && npm run lint && npm run build
```

**Commit:**
```bash
git add . && git commit -m "feat: add listing intake surface"
```

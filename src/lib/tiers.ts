/**
 * Central source of truth for LRPR signup tiers.
 *
 * Each tier maps to a `profiles.role` value. Admin is intentionally omitted
 * from the public picker — it's granted manually via Clerk Dashboard
 * publicMetadata.role and Supabase profiles.role.
 */

export type TierId = "free" | "fsbo" | "agent" | "investor" | "vendor";

export type TierDefinition = {
  id: TierId;
  label: string;
  audience: string;
  blurb: string;
  /** Display string; real Stripe price ID wires in next sprint. */
  price: string;
  cta: string;
  requiresPayment: boolean;
  features: string[];
  /** Optional accent color hint for UI cards. */
  accent: "slate" | "cyan" | "emerald" | "amber" | "rose";
};

export const TIERS: Record<TierId, TierDefinition> = {
  free: {
    id: "free",
    label: "Free account",
    audience: "Buyers, renters, and curious browsers",
    blurb:
      "Save listings, follow the Lake Region market, and get notified when new properties hit the map. No payment required.",
    price: "Free",
    cta: "Continue free",
    requiresPayment: false,
    features: [
      "Save listings to your favorites",
      "Future: set up new-listing email alerts",
      "Browse public records, resources, and service pros",
    ],
    accent: "slate",
  },
  fsbo: {
    id: "fsbo",
    label: "For sale by owner",
    audience: "Owners listing their own property",
    blurb:
      "List your home, land, or rental directly. LRPR admin reviews each submission for accuracy and permission before publishing.",
    price: "Pricing coming soon",
    cta: "Get started",
    requiresPayment: true,
    features: [
      "Submit residential sale, land, or rental listings",
      "Featured placement options",
      "Admin reviews for accuracy and proof of permission",
    ],
    accent: "cyan",
  },
  agent: {
    id: "agent",
    label: "Agent / broker",
    audience: "Licensed real estate professionals",
    blurb:
      "Bulk submit your active inventory, claim a branded agent profile, and reach Lake Region buyers and sellers.",
    price: "Pricing coming soon",
    cta: "Get started",
    requiresPayment: true,
    features: [
      "Unlimited listing submissions",
      "Branded agent profile page",
      "Direct lead inquiries from interested buyers",
    ],
    accent: "emerald",
  },
  investor: {
    id: "investor",
    label: "Investor",
    audience: "Buyers focused on returns and off-market",
    blurb:
      "Get access to investor-only data: parcel deep links, foreclosures, distressed property alerts, and ROI tools.",
    price: "Pricing coming soon",
    cta: "Get started",
    requiresPayment: true,
    features: [
      "Parcel and tax data deep links",
      "Foreclosure and distressed property alerts",
      "ROI and cap-rate calculators",
    ],
    accent: "amber",
  },
  vendor: {
    id: "vendor",
    label: "Vendor / service provider",
    audience: "Local trades, lenders, and professionals",
    blurb:
      "Claim a paid LRPR service-provider profile. Lake Region buyers and renters find you when they need a contractor, inspector, lender, and more.",
    price: "Pricing coming soon",
    cta: "Get started",
    requiresPayment: true,
    features: [
      "Branded service-provider profile",
      "Category placement in /service-pros",
      "Direct inquiry form from prospects",
    ],
    accent: "rose",
  },
};

export const TIER_IDS = Object.keys(TIERS) as TierId[];
export const PAID_TIER_IDS: TierId[] = TIER_IDS.filter(
  (id) => TIERS[id].requiresPayment,
);

/**
 * Tiers permitted to submit property listings via /submit-listing.
 * Free / investor / vendor are blocked because their role isn't "I have
 * property to list." Admin is checked separately and always passes.
 */
export const SUBMITTER_TIERS: TierId[] = ["fsbo", "agent"];

export function isTierId(value: string): value is TierId {
  return (TIER_IDS as readonly string[]).includes(value);
}

/**
 * Authorization helper for /submit-listing gating.
 * Admin (Clerk publicMetadata.role === 'admin') always wins.
 */
export function canSubmitListings(args: {
  profileRole: string | null | undefined;
  isAdmin: boolean;
}): boolean {
  if (args.isAdmin) return true;
  if (!args.profileRole) return false;
  return (SUBMITTER_TIERS as readonly string[]).includes(args.profileRole);
}

/**
 * Tailwind class fragments per accent — keep flat string-class-name literals
 * so Tailwind's JIT picks them up. Edit here when designing card visuals.
 */
export const TIER_ACCENT_CLASSES: Record<
  TierDefinition["accent"],
  { ring: string; chip: string; button: string }
> = {
  slate: {
    ring: "ring-slate-300",
    chip: "bg-slate-100 text-slate-900",
    button: "bg-slate-950 text-white hover:bg-slate-800",
  },
  cyan: {
    ring: "ring-cyan-300",
    chip: "bg-cyan-100 text-cyan-900",
    button: "bg-cyan-700 text-white hover:bg-cyan-800",
  },
  emerald: {
    ring: "ring-emerald-300",
    chip: "bg-emerald-100 text-emerald-900",
    button: "bg-emerald-700 text-white hover:bg-emerald-800",
  },
  amber: {
    ring: "ring-amber-300",
    chip: "bg-amber-100 text-amber-900",
    button: "bg-amber-700 text-white hover:bg-amber-800",
  },
  rose: {
    ring: "ring-rose-300",
    chip: "bg-rose-100 text-rose-900",
    button: "bg-rose-700 text-white hover:bg-rose-800",
  },
};

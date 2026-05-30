/**
 * Catalog of tools/resources a user can pin to their account dashboard.
 *
 * `key` is the stable identifier persisted in saved_tools.tool_key — never
 * rename a key without a data migration. `href` points at where the tool
 * lives; `comingSoon` marks ones whose destination isn't built yet (the
 * dashboard renders those as non-clickable until a page exists).
 */
export type AccountToolCategory = "calculator" | "resource";

export type AccountTool = {
  key: string;
  label: string;
  description: string;
  category: AccountToolCategory;
  href: string;
  icon: string;
  comingSoon?: boolean;
};

export const accountTools: AccountTool[] = [
  {
    key: "mortgage-calculator",
    label: "Mortgage Calculator",
    description: "Estimate monthly principal & interest for a purchase price.",
    category: "calculator",
    href: "#",
    icon: "🧮",
    comingSoon: true,
  },
  {
    key: "affordability-calculator",
    label: "Affordability Calculator",
    description: "See what price range fits your income and down payment.",
    category: "calculator",
    href: "#",
    icon: "💰",
    comingSoon: true,
  },
  {
    key: "rent-vs-buy",
    label: "Rent vs. Buy",
    description: "Compare the long-run cost of renting against owning.",
    category: "calculator",
    href: "#",
    icon: "⚖️",
    comingSoon: true,
  },
  {
    key: "closing-cost-estimator",
    label: "Closing Cost Estimator",
    description: "Ballpark the cash needed to close in the Lake Region.",
    category: "calculator",
    href: "#",
    icon: "📋",
    comingSoon: true,
  },
  {
    key: "flood-maps",
    label: "Flood Map Resources",
    description: "FEMA NFHL lookup-ready flood context before you buy.",
    category: "resource",
    href: "/resources#flood-maps",
    icon: "🌊",
  },
  {
    key: "parcel-lookup",
    label: "Parcel Lookup",
    description: "County appraiser and cadastral parcel links.",
    category: "resource",
    href: "/data-sources",
    icon: "🗺️",
  },
  {
    key: "county-offices",
    label: "County Offices",
    description: "Clay, Bradford, Putnam, and Alachua county contacts.",
    category: "resource",
    href: "/resources#county-offices",
    icon: "🏛️",
  },
  {
    key: "public-data-sources",
    label: "Public Data Sources",
    description: "Census, FCC, and FEMA datasets used across LRPR.",
    category: "resource",
    href: "/data-sources",
    icon: "📊",
  },
];

const byKey = new Map(accountTools.map((t) => [t.key, t]));

export function getToolByKey(key: string): AccountTool | undefined {
  return byKey.get(key);
}

export function isToolKey(key: string): boolean {
  return byKey.has(key);
}

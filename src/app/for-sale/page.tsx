import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingsBrowse } from "@/components/ListingsBrowse";
import {
  getListingsByType,
  saleCategories,
  type ListingStatus,
} from "@/data/site";
import { getFavoriteSlugsForClerkUser } from "@/lib/favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "For Sale — Lake Region Property Resource",
  description:
    "Browse for-sale homes, land, and properties across the Lake Region: Keystone Heights, Starke, Melrose, Interlachen, Hawthorne, and surrounding Clay, Bradford, Putnam, and Alachua counties.",
};

const VALID_STATUSES: ListingStatus[] = ["active", "pending", "sold", "archived"];

type SearchParams = Promise<{ category?: string; status?: string }>;

export default async function ForSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, status } = await searchParams;

  const allForSale = getListingsByType("for-sale");
  const activeCategory = category && saleCategories.includes(category) ? category : null;
  const activeStatus =
    status && (VALID_STATUSES as readonly string[]).includes(status)
      ? (status as ListingStatus)
      : null;

  // Default "no status filter" => active + pending only; explicit filter
  // (including sold/archived) honors the user choice.
  const filtered = allForSale.filter((l) => {
    if (activeCategory && l.category !== activeCategory) return false;
    if (activeStatus) return l.status === activeStatus;
    return l.status === "active" || l.status === "pending";
  });

  // Personalization for the save buttons in each card.
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const supabase = createSupabaseServerClient();
  const savedSlugs = await getFavoriteSlugsForClerkUser(supabase, userId);

  return (
    <>
      <Header />
      <ListingsBrowse
        type="for-sale"
        listings={filtered}
        allListings={allForSale}
        categories={saleCategories}
        category={activeCategory}
        status={activeStatus}
        savedSlugs={savedSlugs}
        isSignedIn={isSignedIn}
        title="Lake Region For Sale"
        description="Approved Lake Region for-sale listings across Clay, Bradford, Putnam, and Alachua counties. Each address links into public parcel data, city/county hubs, and a side-by-side map. Save anything you want to come back to."
      />
      <InternalLinkHub />
    </>
  );
}

import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingsBrowse } from "@/components/ListingsBrowse";
import {
  getListingsByType,
  rentCategories,
  type ListingStatus,
} from "@/data/site";
import { getFavoriteSlugsForClerkUser } from "@/lib/favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "For Rent — Lake Region Property Resource",
  description:
    "Browse Lake Region rentals: single-family homes, apartments, condos, seasonal, and commercial leases across Clay, Bradford, Putnam, and Alachua counties.",
};

const VALID_STATUSES: ListingStatus[] = ["active", "pending", "sold", "archived"];

type SearchParams = Promise<{ category?: string; status?: string }>;

export default async function ForRentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, status } = await searchParams;

  const allForRent = getListingsByType("for-rent");
  const activeCategory = category && rentCategories.includes(category) ? category : null;
  const activeStatus =
    status && (VALID_STATUSES as readonly string[]).includes(status)
      ? (status as ListingStatus)
      : null;

  const filtered = allForRent.filter((l) => {
    if (activeCategory && l.category !== activeCategory) return false;
    if (activeStatus) return l.status === activeStatus;
    return l.status === "active" || l.status === "pending";
  });

  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const supabase = createSupabaseServerClient();
  const savedSlugs = await getFavoriteSlugsForClerkUser(supabase, userId);

  return (
    <>
      <Header />
      <ListingsBrowse
        type="for-rent"
        listings={filtered}
        allListings={allForRent}
        categories={rentCategories}
        category={activeCategory}
        status={activeStatus}
        savedSlugs={savedSlugs}
        isSignedIn={isSignedIn}
        title="Lake Region For Rent"
        description="Approved Lake Region rental listings — single-family, apartments and condos, seasonal stays, and commercial leases. Every record links to the city and county hub, with public-data joins for parcel-level facts."
      />
      <InternalLinkHub />
    </>
  );
}

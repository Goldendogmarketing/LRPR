import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { getListingsByType, rentCategories } from "@/data/site";

export const metadata = {
  title: "Lake Region Rentals | Homes, Apartments, Seasonal Rentals | LRPR",
  description: "Browse Lake Region rentals with apartment, condo, single-family, seasonal, and commercial lease categories.",
};

export default function ForRentPage() {
  const rentalListings = getListingsByType("for-rent");
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">For Rent</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Lake Region rentals in one clean lane.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Rental inventory gets dedicated local architecture for apartments, single-family rentals, seasonal stays, and commercial leases.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {rentCategories.map((category) => <a className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm" href={`#${category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-").replaceAll("/", "")}`} key={category}>{category}</a>)}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rentalListings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { getListingsByType, saleCategories } from "@/data/site";

export const metadata = {
  title: "Lake Region Homes and Property For Sale | LRPR",
  description: "Browse Lake Region homes, lakefront property, land, acreage, and commercial property for sale with city and county links.",
};

export default function ForSalePage() {
  const saleListings = getListingsByType("for-sale");
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">For Sale</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Lake Region property for sale.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Flat category paths for homes, land, lakefront property, and commercial property connected to local city and county pages.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {saleCategories.map((category) => <a className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm" href={`#${category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`} key={category}>{category}</a>)}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saleListings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

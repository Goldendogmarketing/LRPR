import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { cities, counties, getListingsByCounty } from "@/data/site";

export function generateStaticParams() {
  return counties.map((county) => ({ slug: county.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const county = counties.find((item) => item.slug === slug);
  if (!county) return {};
  return {
    title: `${county.name} ${county.state} Real Estate, Rentals, Resources | LRPR`,
    description: county.description,
  };
}

export default async function CountyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const county = counties.find((item) => item.slug === slug);
  if (!county) notFound();
  const countyListings = getListingsByCounty(county.name);
  const countyCities = cities.filter((city) => city.county === county.name);

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">County hub</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{county.name}, {county.state} real estate and resources.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{county.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          {countyCities.map((city) => <a className="rounded-full bg-white px-4 py-2" href={`/cities/${city.slug}`} key={city.slug}>{city.name}</a>)}
          <a className="rounded-full bg-white px-4 py-2" href="/resources">County resources</a>
          <a className="rounded-full bg-white px-4 py-2" href="/service-pros">County service pros</a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {countyListings.length > 0 ? countyListings.map((listing) => <ListingCard listing={listing} key={listing.id} />) : <p className="rounded-3xl bg-white p-6 text-sm font-semibold text-slate-600">No seeded listings yet. This county page is ready for local content and internal links.</p>}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

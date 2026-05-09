import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { cities, getListingsByCity } from "@/data/site";

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);
  if (!city) return {};
  return {
    title: `${city.name} ${city.state} Real Estate, Rentals, Resources | LRPR`,
    description: city.description,
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);
  if (!city) notFound();
  const cityListings = getListingsByCity(city.name);

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">City hub</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{city.name}, {city.state} property resource hub.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{city.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          <a className="rounded-full bg-white px-4 py-2" href="/for-sale">Homes for sale</a>
          <a className="rounded-full bg-white px-4 py-2" href="/for-rent">Rentals</a>
          <a className="rounded-full bg-white px-4 py-2" href="/resources">Local resources</a>
          <a className="rounded-full bg-white px-4 py-2" href="/service-pros">Service Pros</a>
          <a className="rounded-full bg-cyan-950 px-4 py-2 text-white" href={`/counties/${city.county.toLowerCase().replaceAll(" ", "-")}`}>{city.county}</a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cityListings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

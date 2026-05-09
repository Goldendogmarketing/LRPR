import { notFound } from "next/navigation";
import { DatasetSourcePanel } from "@/components/DatasetSourcePanel";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { PublicDataFacts } from "@/components/PublicDataFacts";
import { getDatasetsForCity } from "@/data/datasets";
import { cities, getListingsByCity, slugify } from "@/data/site";
import { getCityPublicDataFacts, getPublicDataGeneratedAt } from "@/lib/public-data-enrichment";

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
  const cityDatasets = getDatasetsForCity(city.name);
  const publicDataFacts = getCityPublicDataFacts(city.slug);

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
          {city.counties.map((countyName) => (
            <a className="rounded-full bg-cyan-950 px-4 py-2 text-white" href={`/counties/${slugify(countyName)}`} key={countyName}>{countyName}</a>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {city.localAngles.map((angle) => <div className="rounded-3xl bg-white p-5 text-sm font-bold text-slate-700 shadow-sm" key={angle}>{angle}</div>)}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cityListings.length > 0 ? cityListings.map((listing) => <ListingCard listing={listing} key={listing.id} />) : <p className="rounded-3xl bg-white p-6 text-sm font-semibold text-slate-600">No seeded listings yet. This city page is ready for real listings and local dataset enrichment.</p>}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicDataFacts
          title={`${city.name} official data snapshot`}
          description="These are page-ready facts generated from the local public-data cache. They are meant to make each LRPR city hub genuinely useful without copying real-estate portal feeds."
          facts={publicDataFacts}
          generatedAt={getPublicDataGeneratedAt()}
        />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DatasetSourcePanel title={`Datasets that can make ${city.name} pages unique`} sources={cityDatasets} />
      </section>
      <InternalLinkHub />
    </main>
  );
}

import Link from "next/link";
import { CategoryPanel } from "@/components/CategoryPanel";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { ListingCard } from "@/components/ListingCard";
import { SearchHero } from "@/components/SearchHero";
import { listings, rentCategories, resources, saleCategories, servicePros } from "@/data/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <SearchHero />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          ["Flat architecture", "Homepage links directly to listings, cities, counties, resources, and vendor categories."],
          ["Less than 3 clicks", "Any destination should be reachable from the homepage or one local hub page."],
          ["Local relevance", "City and county pages reinforce each listing with internal location signals."],
          ["Map-ready data", "Every listing record includes latitude, longitude, and Google Maps links."],
        ].map(([title, copy]) => (
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" key={title}>
            <h2 className="text-base font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </section>

      <InternalLinkHub />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <CategoryPanel eyebrow="For Sale" title="Browse sale categories without getting lost." copy="Direct paths for buyers and search engines: lakefront, single-family, land, and commercial property." categories={saleCategories} basePath="/for-sale" />
        <CategoryPanel eyebrow="For Rent" title="Rental search gets its own clean lane." copy="Rentals stay separate from sale inventory, with their own categories and local pages." categories={rentCategories} basePath="/for-rent" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Featured local records</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Address-level listing pages with local links.</h2>
          </div>
          <Link className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white sm:block" href="/for-sale">View listings</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((listing) => <ListingCard listing={listing} key={listing.id} />)}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8" id="resources">
        <div className="rounded-[2rem] bg-cyan-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Resources</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Local numbers and contacts in one place.</h2>
          <p className="mt-4 text-sm leading-7 text-cyan-50/80">Utility, municipal, county, school, emergency, permit, and zoning links can connect into each city and county page.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => <Link className="rounded-3xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm" href={`/resources#${resource.toLowerCase().replaceAll(" ", "-")}`} key={resource}>{resource}<p className="mt-2 text-sm font-medium leading-6 text-slate-500">Directory-ready placeholder for names, phone numbers, links, and notes.</p></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8" id="service-pros">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Service Pros</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Vendors for real-estate service work.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">This tab name is short, clear on mobile, and scalable for paid placements.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {servicePros.map((service) => <Link className="rounded-3xl bg-[#f7f3eb] p-5" href={`/service-pros#${service.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`} key={service}><div className="mb-6 h-10 w-10 rounded-2xl bg-slate-950" /><h3 className="font-black text-slate-950">{service}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Future vendor cards, featured placements, contact forms, and reviews.</p></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}

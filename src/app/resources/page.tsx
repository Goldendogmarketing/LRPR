import Link from "next/link";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { cities, counties, resources } from "@/data/site";

export const metadata = {
  title: "Lake Region Local Resources | Utilities, Municipal, County Contacts",
  description: "Find local Lake Region utility numbers, municipal contacts, county offices, schools, emergency numbers, permits, and zoning resources.",
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Resources</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Lake Region numbers, contacts, and property resources.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">A local resource hub that can internally link to every city, county, buyer/seller guide, service category, and listing page.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" id={resource.toLowerCase().replaceAll(" ", "-")} key={resource}><h2 className="text-xl font-black">{resource}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Placeholder for phone numbers, official links, hours, addresses, notes, and related local pages.</p></section>)}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link className="rounded-3xl bg-cyan-950 p-6 text-white" href={`/cities/${cities[0].slug}`}>Devils Lake resource page →</Link>
          <Link className="rounded-3xl bg-slate-950 p-6 text-white" href={`/counties/${counties[0].slug}`}>Ramsey County property hub →</Link>
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

import Link from "next/link";
import { Header } from "@/components/Header";

const resourceTypes = [
  "City contacts",
  "County offices",
  "Utilities",
  "Permits and zoning",
  "Schools",
  "Parks and lakes",
  "Flood and parcel links",
  "Local guides",
];

const curationRules = [
  "Admin enters or imports the resource record directly",
  "Prefer official source URLs and public agency pages",
  "Connect each record to cities, counties, and property pages",
  "Flag stale links for periodic admin review",
  "No public resource submissions in MVP",
];

export const metadata = {
  title: "Admin Local Resources | LRPR",
  description: "Admin-added local resource data scaffold for Lake Region Property Resource.",
};

export default function AdminResourcesPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-cyan-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Admin added data</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Local resources are curated by LRPR admin.</h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-cyan-50/85">City/county resources, utilities, public data links, parks, lakes, schools, permits, and guides should be added from admin-curated sources rather than a public submission form.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-white px-5 py-3 text-sm font-black text-cyan-950">Back to admin queue</Link>
            <Link href="/resources" className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15">View public resources</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Curation rules</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Keep resource data official and local</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {curationRules.map((rule) => <div className="rounded-2xl bg-[#f8faf9] p-4 text-sm font-bold leading-6 text-slate-700" key={rule}>✓ {rule}</div>)}
            </div>
          </section>
          <aside className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Resource types</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {resourceTypes.map((type) => <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-900" key={type}>{type}</span>)}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

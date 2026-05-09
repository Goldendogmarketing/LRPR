import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { cities, servicePros } from "@/data/site";

export const metadata = {
  title: "Lake Region Service Pros | Plumbing, Electrical, HVAC, Landscaping",
  description: "Find Lake Region real-estate service professionals for plumbing, electrical, HVAC, landscaping, inspection, cleaning, staging, and property management.",
};

export default function ServiceProsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Service Pros</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Real-estate service vendors across the Lake Region.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">A dedicated vendor directory for repairs, inspections, improvements, and property maintenance — built for future paid placements.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {servicePros.map((service) => <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" id={service.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")} key={service}><h2 className="text-xl font-black">{service}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Vendor profiles, service areas, phone numbers, reviews, and lead forms will live here.</p><p className="mt-4 text-xs font-bold text-cyan-800">Serves {cities.map((city) => city.name).join(", ")}</p></section>)}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

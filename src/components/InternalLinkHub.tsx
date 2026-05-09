import Link from "next/link";
import { cities, counties, rentCategories, resources, saleCategories, servicePros } from "@/data/site";

export function InternalLinkHub() {
  const groups = [
    { title: "Listing paths", links: [["Homes for sale", "/for-sale"], ["Rentals", "/for-rent"], ["Lakefront homes", "/for-sale#lakefront-homes"], ["Land & acreage", "/for-sale#land-acreage"]] },
    { title: "Cities", links: cities.map((city) => [city.name, `/cities/${city.slug}`]) },
    { title: "Counties", links: counties.map((county) => [county.name, `/counties/${county.slug}`]) },
    { title: "Resources", links: [["Local resources", "/resources"], ["Service Pros", "/service-pros"], ...resources.slice(0, 3).map((item) => [item, `/resources#${item.toLowerCase().replaceAll(" ", "-")}`])] },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-label="Local internal link hub">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Local SEO hub</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Reach every major destination in two clicks or less.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Flat architecture connects listings, cities, counties, categories, resources, and service providers from the homepage for stronger local relevance and crawlability.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div className="rounded-3xl bg-[#f7f3eb] p-5" key={group.title}>
              <h3 className="font-black text-slate-950">{group.title}</h3>
              <div className="mt-3 flex flex-col gap-2">
                {group.links.map(([label, href]) => (
                  <Link className="text-sm font-bold text-slate-700 hover:text-cyan-800" href={href} key={href}>→ {label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
          {[...saleCategories, ...rentCategories, ...servicePros.slice(0, 4)].map((item) => <span className="rounded-full bg-slate-100 px-3 py-1" key={item}>{item}</span>)}
        </div>
      </div>
    </section>
  );
}

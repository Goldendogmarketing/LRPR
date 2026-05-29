import Link from "next/link";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { cities, counties, resources } from "@/data/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Lake Region Local Resources | Utilities, Municipal, County Contacts",
  description:
    "Find local Lake Region utility numbers, municipal contacts, county offices, schools, emergency numbers, permits, and zoning resources.",
};

type LocalResourceRow = {
  id: string;
  title: string | null;
  resource_type: string | null;
  city: string | null;
  county: string | null;
  official_url: string | null;
  source_name: string | null;
  notes: string | null;
  admin_approved: boolean | null;
};

export default async function ResourcesPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("local_resources")
    .select(
      "id, title, resource_type, city, county, official_url, source_name, notes, admin_approved",
    )
    .eq("admin_approved", true)
    .order("resource_type", { ascending: true });

  const dbResources: LocalResourceRow[] = rows ?? [];

  // Group by resource_type
  const grouped: Record<string, LocalResourceRow[]> = {};
  for (const r of dbResources) {
    const key = r.resource_type ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }
  const resourceTypeKeys = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">
          Resources
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
          Lake Region numbers, contacts, and property resources.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          A local resource hub that can internally link to every city, county,
          buyer/seller guide, service category, and listing page.
        </p>

        {/* DB-backed approved resources */}
        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
            Local resource directory
          </p>
          {dbResources.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Resource directory coming soon. Check back for curated local links.
            </p>
          ) : (
            <div className="mt-4 space-y-8">
              {resourceTypeKeys.map((type) => (
                <div key={type}>
                  <h2 className="mb-3 text-lg font-black text-slate-800">
                    {type}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grouped[type].map((r) => (
                      <div
                        key={r.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <h3 className="text-base font-black text-slate-900">
                          {r.title ?? "Resource"}
                        </h3>
                        {(r.city || r.county) && (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {[r.city, r.county].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {r.source_name && (
                          <p className="mt-1 text-xs text-slate-400">
                            {r.source_name}
                          </p>
                        )}
                        {r.notes && (
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            {r.notes}
                          </p>
                        )}
                        {r.official_url && (
                          <a
                            href={r.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-xs font-bold text-cyan-700 hover:underline"
                          >
                            Official link &rarr;
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Static category grid — kept as-is from the original page */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <section
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              id={resource.toLowerCase().replaceAll(" ", "-")}
              key={resource}
            >
              <h2 className="text-xl font-black">{resource}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Placeholder for phone numbers, official links, hours, addresses,
                notes, and related local pages.
              </p>
            </section>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            className="rounded-3xl bg-cyan-950 p-6 text-white"
            href={`/cities/${cities[0].slug}`}
          >
            Keystone Heights resource page &rarr;
          </Link>
          <Link
            className="rounded-3xl bg-slate-950 p-6 text-white"
            href={`/counties/${counties[0].slug}`}
          >
            Clay County property hub &rarr;
          </Link>
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

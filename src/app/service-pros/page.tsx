import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { VendorFavoriteButton } from "@/components/VendorFavoriteButton";
import { cities, servicePros } from "@/data/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getVendorFavoriteIds } from "@/lib/account-data";

export const metadata = {
  title: "Lake Region Service Pros | Plumbing, Electrical, HVAC, Landscaping",
  description:
    "Find Lake Region real-estate service professionals for plumbing, electrical, HVAC, landscaping, inspection, cleaning, staging, and property management.",
};

type ServiceProviderRow = {
  id: string;
  business_name: string | null;
  category: string | null;
  city: string | null;
  county: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  verified: boolean | null;
  sponsored: boolean | null;
  admin_approved: boolean | null;
};

export default async function ServiceProsPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("service_provider_profiles")
    .select(
      "id, business_name, category, city, county, contact_email, contact_phone, website_url, verified, sponsored, admin_approved",
    )
    .eq("admin_approved", true)
    .order("sponsored", { ascending: false });

  const providers: ServiceProviderRow[] = rows ?? [];

  const user = await currentUser();
  const isSignedIn = Boolean(user);
  const savedVendorIds = await getVendorFavoriteIds(supabase, user?.id);

  // Group by category
  const grouped: Record<string, ServiceProviderRow[]> = {};
  for (const p of providers) {
    const key = p.category ?? "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }
  const categories = Object.keys(grouped).sort();

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">
          Service Pros
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
          Real-estate service vendors across the Lake Region.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          A dedicated vendor directory for repairs, inspections, improvements,
          and property maintenance — built for future paid placements.
        </p>

        {/* DB-backed verified providers */}
        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
            Verified Lake Region providers
          </p>
          {providers.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Directory coming soon. Check back for verified local pros.
            </p>
          ) : (
            <div className="mt-4 space-y-8">
              {categories.map((cat) => (
                <div key={cat}>
                  <h2 className="mb-3 text-lg font-black text-slate-800">
                    {cat}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grouped[cat].map((p) => (
                      <div
                        key={p.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-black text-slate-900">
                            {p.business_name ?? "Provider"}
                          </h3>
                          <div className="flex shrink-0 items-center gap-1">
                            {p.sponsored && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                                Sponsored
                              </span>
                            )}
                            {p.verified && (
                              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-black text-cyan-800">
                                Verified
                              </span>
                            )}
                            <VendorFavoriteButton
                              vendorId={p.id}
                              vendorName={p.business_name}
                              vendorCategory={p.category}
                              isSaved={savedVendorIds.has(p.id)}
                              isSignedIn={isSignedIn}
                              redirectTo="/service-pros"
                            />
                          </div>
                        </div>
                        {(p.city || p.county) && (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {[p.city, p.county].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                          {p.contact_phone && (
                            <a
                              href={`tel:${p.contact_phone}`}
                              className="text-cyan-700 hover:underline"
                            >
                              {p.contact_phone}
                            </a>
                          )}
                          {p.contact_email && (
                            <a
                              href={`mailto:${p.contact_email}`}
                              className="text-cyan-700 hover:underline"
                            >
                              {p.contact_email}
                            </a>
                          )}
                          {p.website_url && (
                            <a
                              href={p.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-700 hover:underline"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Static category grid — kept as-is from the original page */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {servicePros.map((service) => (
            <section
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              id={service
                .toLowerCase()
                .replaceAll(" & ", "-")
                .replaceAll(" ", "-")}
              key={service}
            >
              <h2 className="text-xl font-black">{service}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Vendor profiles, service areas, phone numbers, reviews, and lead
                forms will live here.
              </p>
              <p className="mt-4 text-xs font-bold text-cyan-800">
                Serves {cities.map((city) => city.name).join(", ")}
              </p>
            </section>
          ))}
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

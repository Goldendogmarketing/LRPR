import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { cities, counties } from "@/data/site";
import { getAllListings } from "@/lib/listings-source";
import { getFavoriteSlugsForClerkUser } from "@/lib/favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Search — Lake Region Property Resource",
  description:
    "Search listings, cities, and counties across the Lake Region: Keystone Heights, Starke, Melrose, Interlachen, Hawthorne, and surrounding Clay, Bradford, Putnam, and Alachua counties.",
};

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;

  const supabase = createSupabaseServerClient();
  const allListings = await getAllListings(supabase);

  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const savedSlugs = await getFavoriteSlugsForClerkUser(supabase, userId);

  const query = (q ?? "").trim().toLowerCase();

  // ── Filter helpers ──────────────────────────────────────────────────
  const matchedListings = query
    ? allListings.filter((l) =>
        `${l.address} ${l.city} ${l.county} ${l.category} ${l.status} ${l.price} ${l.type}`
          .toLowerCase()
          .includes(query),
      )
    : [];

  const matchedCities = query
    ? cities.filter((c) =>
        `${c.name} ${c.primaryCounty} ${c.localAngles.join(" ")}`
          .toLowerCase()
          .includes(query),
      )
    : [];

  const matchedCounties = query
    ? counties.filter((c) => c.name.toLowerCase().includes(query))
    : [];

  const hasResults =
    matchedListings.length > 0 ||
    matchedCities.length > 0 ||
    matchedCounties.length > 0;

  // Sample shown when no query
  const sampleListings = allListings.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search form */}
        <form action="/search" className="mb-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>
              <input
                name="q"
                defaultValue={q ?? ""}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                placeholder="Search address, city, county, category…"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="h-14 rounded-2xl bg-slate-950 px-8 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-950"
            >
              Search
            </button>
          </div>
        </form>

        {/* No query yet — show a sample */}
        {!query && (
          <>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                Explore the Lake Region database
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                Search listings, cities, and counties.
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Type any address, city, county, category, or status to find
                what you need.
              </p>
            </div>

            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-black text-slate-700">
                Sample listings
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sampleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isSignedIn={isSignedIn}
                  isSaved={savedSlugs.has(listing.slug)}
                />
              ))}
            </div>
          </>
        )}

        {/* Query present but no matches */}
        {query && !hasResults && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              No results for &ldquo;{q}&rdquo;
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different address, city name, county, or category.
            </p>
          </div>
        )}

        {/* ── Listings results ─────────────────────────────────────── */}
        {query && matchedListings.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-5 text-xl font-black tracking-tight text-slate-950">
              Listings ({matchedListings.length})
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isSignedIn={isSignedIn}
                  isSaved={savedSlugs.has(listing.slug)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── City results ─────────────────────────────────────────── */}
        {query && matchedCities.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-black tracking-tight text-slate-950">
              Cities ({matchedCities.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {matchedCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-700 hover:text-cyan-800 hover:shadow-md"
                >
                  <span className="block">{city.name}</span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {city.primaryCounty} · FL
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── County results ───────────────────────────────────────── */}
        {query && matchedCounties.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-black tracking-tight text-slate-950">
              Counties ({matchedCounties.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {matchedCounties.map((county) => (
                <Link
                  key={county.slug}
                  href={`/counties/${county.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-700 hover:text-cyan-800 hover:shadow-md"
                >
                  <span className="block">{county.name}</span>
                  <span className="block text-xs font-semibold text-slate-500">
                    Florida
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listings as siteListings } from "@/data/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My favorites | Lake Region Property Resource",
  description: "Listings you've saved for later on Lake Region Property Resource.",
};

export default async function FavoritesPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/favorites");
  }

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  let savedSlugs = new Set<string>();
  if (profile) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("listing_slug")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    savedSlugs = new Set((favorites ?? []).map((f) => f.listing_slug as string));
  }

  // Order by the saved order (most recent first).
  const slugList = Array.from(savedSlugs);
  const savedListings = slugList
    .map((slug) => siteListings.find((l) => l.slug === slug))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  // Orphans = slugs in DB that don't match a current listing (e.g. removed).
  const orphanCount = slugList.length - savedListings.length;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
              Your favorites
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              {savedListings.length > 0
                ? `${savedListings.length} saved listing${savedListings.length === 1 ? "" : "s"}`
                : "No favorites yet"}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Listings you save show up here so you can come back to them later.
              Tap the heart ♡ on any listing to add or remove it.
            </p>
          </div>
          <Link
            href="/for-sale"
            className="self-start rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 sm:self-auto"
          >
            Browse listings →
          </Link>
        </div>

        {orphanCount > 0 ? (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-100">
            {orphanCount} saved listing{orphanCount === 1 ? "" : "s"} no longer
            exist and were hidden.
          </div>
        ) : null}

        {savedListings.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-3xl">♡</p>
            <p className="mt-3 text-base font-bold text-slate-700">
              Save a listing to start your shortlist.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Browse{" "}
              <Link href="/for-sale" className="font-black text-cyan-800 underline">
                for sale
              </Link>{" "}
              or{" "}
              <Link href="/for-rent" className="font-black text-cyan-800 underline">
                for rent
              </Link>{" "}
              to find a property you like.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedListings.map((listing) => (
              <ListingCard
                listing={listing}
                key={listing.id}
                isSaved={true}
                isSignedIn={true}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

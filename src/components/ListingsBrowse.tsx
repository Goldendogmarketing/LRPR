import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import {
  type Listing,
  type ListingType,
  statusLabels,
  type ListingStatus,
} from "@/data/site";

const STATUS_OPTIONS: ListingStatus[] = ["active", "pending", "sold", "archived"];

type Props = {
  type: ListingType;
  /** Cards to render. Pre-filtered by category/status on the page level. */
  listings: Listing[];
  /** All listings of this type, for "showing X of Y" + chip counts. */
  allListings: Listing[];
  categories: string[];
  /** Active category from ?category=... or null for "All". */
  category: string | null;
  /** Active status from ?status=... or null for "Active + Pending only". */
  status: ListingStatus | null;
  /** Favorite slugs for the signed-in user. Empty set when anonymous. */
  savedSlugs: Set<string>;
  isSignedIn: boolean;
  title: string;
  description: string;
};

/**
 * Shared light-themed browse page used by /for-sale and /for-rent.
 *
 * Layout: hero band, filter chip rail (category + status), card grid.
 *
 * Filtering is URL-driven (`?category=...`, `?status=...`) so the page
 * stays a server component and shareable links survive copy/paste. Chips
 * are plain <Link> elements, no JS required.
 */
export function ListingsBrowse({
  type,
  listings,
  allListings,
  categories,
  category,
  status,
  savedSlugs,
  isSignedIn,
  title,
  description,
}: Props) {
  const baseHref = type === "for-sale" ? "/for-sale" : "/for-rent";

  // Build link href that preserves the other filter when toggling one.
  const buildHref = (next: { category?: string | null; status?: string | null }) => {
    const params = new URLSearchParams();
    const cat = next.category === undefined ? category : next.category;
    const st = next.status === undefined ? status : next.status;
    if (cat) params.set("category", cat);
    if (st) params.set("status", st);
    const qs = params.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  };

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">
          Lake Region · Browse
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">{description}</p>
      </section>

      {/* Filter rail */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Category
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              href={buildHref({ category: null })}
              active={!category}
              label={`All (${allListings.length})`}
            />
            {categories.map((c) => {
              const count = allListings.filter((l) => l.category === c).length;
              return (
                <Chip
                  key={c}
                  href={buildHref({ category: c })}
                  active={category === c}
                  label={`${c} (${count})`}
                />
              );
            })}
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Status
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              href={buildHref({ status: null })}
              active={!status}
              label="Active + Pending"
            />
            {STATUS_OPTIONS.map((s) => {
              const count = allListings.filter((l) => l.status === s).length;
              return (
                <Chip
                  key={s}
                  href={buildHref({ status: s })}
                  active={status === s}
                  label={`${statusLabels[s]} (${count})`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-600">
            Showing <span className="text-slate-950">{listings.length}</span> of {allListings.length}
          </p>
          {!isSignedIn ? (
            <Link
              href="/sign-up"
              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-slate-800"
            >
              Sign up to save listings ♡
            </Link>
          ) : (
            <Link
              href="/favorites"
              className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
            >
              My favorites ♥
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200">
            <p className="text-lg font-black">No results match these filters.</p>
            <p className="mt-2 text-sm text-slate-600">
              Try clearing the filters above or browse the full inventory.
            </p>
            <Link
              href={baseHref}
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-2 text-sm font-black text-white"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ListingCard
                listing={item}
                key={item.id}
                isSignedIn={isSignedIn}
                isSaved={savedSlugs.has(item.slug)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-slate-950 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white"
          : "rounded-full bg-slate-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-700 hover:bg-slate-200"
      }
    >
      {label}
    </Link>
  );
}

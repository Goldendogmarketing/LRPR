import Link from "next/link";
import {
  cities,
  counties,
  rentCategories,
  resources,
  saleCategories,
  servicePros,
} from "@/data/site";

const anchor = (label: string) =>
  label.toLowerCase().replaceAll(" & ", "-").replaceAll(" / ", "-").replaceAll(" ", "-");

type Col = { title: string; links: [string, string][] };

export function Footer() {
  const columns: Col[] = [
    {
      title: "For Sale",
      links: [
        ["All for sale", "/for-sale"],
        ...saleCategories.map(
          (c) => [c, `/for-sale#${anchor(c)}`] as [string, string],
        ),
      ],
    },
    {
      title: "For Rent",
      links: [
        ["All rentals", "/for-rent"],
        ...rentCategories.map(
          (c) => [c, `/for-rent#${anchor(c)}`] as [string, string],
        ),
      ],
    },
    {
      title: "Service Pros",
      links: [
        ["All service pros", "/service-pros"],
        ...servicePros
          .slice(0, 6)
          .map((s) => [s, `/service-pros#${anchor(s)}`] as [string, string]),
      ],
    },
    {
      title: "Resources",
      links: [
        ["All resources", "/resources"],
        ...resources
          .slice(0, 6)
          .map((r) => [r, `/resources#${anchor(r)}`] as [string, string]),
      ],
    },
    {
      title: "Cities",
      links: cities.map(
        (c) => [c.name, `/cities/${c.slug}`] as [string, string],
      ),
    },
    {
      title: "Counties",
      links: [
        ...counties.map(
          (c) => [c.name, `/counties/${c.slug}`] as [string, string],
        ),
        ["Public data sources", "/data-sources"],
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Brand + CTA */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2" aria-label="Lake Region Property Resource home">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-sm font-bold text-slate-950">
                LR
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-black tracking-tight text-white sm:text-base">
                  Lake Region
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Property Resource
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              A local hub for Lake Region homes, rentals, land, resources, and
              trusted service providers across Clay, Bradford, Putnam, and
              Alachua counties.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/submit-listing"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-200"
            >
              Submit a listing
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm font-semibold text-slate-400 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Legal + credit */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} Lake Region Property Resource</span>
            <Link href="/privacy" className="font-semibold transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-semibold transition hover:text-white">
              Terms of Service
            </Link>
          </div>
          <p>
            Built by{" "}
            <a
              href="https://www.ihelpbuild.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-white underline underline-offset-4 transition hover:text-cyan-300"
            >
              ihelpbuild
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

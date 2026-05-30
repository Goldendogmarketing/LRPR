import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AccountMenu } from "@/components/AccountMenu";

const navItems = [
  ["For Sale", "/for-sale"],
  ["For Rent", "/for-rent"],
  ["Service Pros", "/service-pros"],
  ["Resources", "/resources"],
];

export async function Header() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f7f3eb]/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: navigation */}
        <div className="flex items-center justify-start">
          <nav className="hidden items-center rounded-full border border-slate-200 bg-white/75 p-1 shadow-sm lg:flex">
            {navItems.map(([label, href]) => (
              <Link
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-950 hover:text-white"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/resources"
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm lg:hidden"
          >
            Menu
          </Link>
        </div>

        {/* Center: logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2"
          aria-label="Lake Region Property Resource home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            LR
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-tight sm:text-base">
              Lake Region
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Property Resource
            </span>
          </span>
        </Link>

        {/* Right: auth actions */}
        <div className="flex items-center justify-end gap-2">
          {isSignedIn ? (
            <>
              <Link
                href="/favorites"
                className="hidden rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 sm:inline-flex"
                aria-label="My favorites"
              >
                <span aria-hidden className="mr-1.5">♥</span>
                Favorites
              </Link>
              <AccountMenu />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

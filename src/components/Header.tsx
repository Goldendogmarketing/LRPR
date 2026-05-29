import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const navItems = [
  ["For Sale", "/for-sale"],
  ["For Rent", "/for-rent"],
  ["Resources", "/resources"],
  ["Service Pros", "/service-pros"],
  ["Cities", "/cities/keystone-heights"],
  ["Counties", "/counties/clay-county"],
  ["Data", "/data-sources"],
  ["Submit", "/submit-listing"],
  ["Admin", "/admin"],
];

export async function Header() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f7f3eb]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
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

        <div className="flex items-center gap-2">
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
              <Link
                href="/account"
                className="hidden rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 sm:inline-flex"
                aria-label="My account"
              >
                Account
              </Link>
              {/* Clerk v7 removed afterSignOutUrl from UserButton; the
                  sign-out destination is configured globally on the
                  ClerkProvider. Default is "/" which is what we want. */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="hidden rounded-full bg-slate-950 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex">
                  Sign up
                </button>
              </SignUpButton>
            </>
          )}
          <Link
            href="/resources"
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm lg:hidden"
          >
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}

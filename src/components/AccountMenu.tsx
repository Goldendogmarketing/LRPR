"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial =
    user?.firstName?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ??
    "?";
  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "My account";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline">Account</span>
        <span aria-hidden className="text-[10px] text-slate-400">▼</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {displayName}
            </p>
          </div>

          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <span aria-hidden>👤</span>
            Account profile
          </Link>
          <Link
            href="/favorites"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:hidden"
          >
            <span aria-hidden>♥</span>
            Favorites
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ redirectUrl: "/" });
            }}
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <span aria-hidden>⎋</span>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

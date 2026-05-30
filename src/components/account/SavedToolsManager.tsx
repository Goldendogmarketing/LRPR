"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleSavedToolAction } from "@/app/account/dashboard-actions";
import { accountTools } from "@/data/tools";

function ToggleForm({
  toolKey,
  saved,
  children,
}: {
  toolKey: string;
  saved: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={toggleSavedToolAction}>
      <input type="hidden" name="tool_key" value={toolKey} />
      <button
        type="submit"
        aria-label={saved ? "Remove tool" : "Add tool"}
        className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
          saved
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

export function SavedToolsManager({ savedKeys }: { savedKeys: string[] }) {
  const [picking, setPicking] = useState(false);
  const savedSet = new Set(savedKeys);
  const saved = accountTools.filter((t) => savedSet.has(t.key));
  const available = accountTools.filter((t) => !savedSet.has(t.key));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {saved.length} pinned
        </p>
        <button
          type="button"
          onClick={() => setPicking((v) => !v)}
          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
        >
          {picking ? "Done" : "+ Add tools"}
        </button>
      </div>

      {/* Pinned tools */}
      {saved.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
          No tools pinned yet. Add calculators and resources for quick access.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {saved.map((tool) => (
            <li
              key={tool.key}
              className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200"
            >
              <span aria-hidden className="text-2xl">{tool.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {tool.comingSoon ? (
                    <span className="text-sm font-black text-slate-900">{tool.label}</span>
                  ) : (
                    <Link
                      href={tool.href}
                      className="text-sm font-black text-slate-900 hover:text-cyan-800"
                    >
                      {tool.label}
                    </Link>
                  )}
                  {tool.comingSoon && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {tool.description}
                </p>
              </div>
              <ToggleForm toolKey={tool.key} saved>
                Remove
              </ToggleForm>
            </li>
          ))}
        </ul>
      )}

      {/* Catalog picker */}
      {picking && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Available tools & resources
          </p>
          {available.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              You&apos;ve pinned everything available.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {available.map((tool) => (
                <li
                  key={tool.key}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100"
                >
                  <span aria-hidden className="text-xl">{tool.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900">{tool.label}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      {tool.description}
                    </p>
                  </div>
                  <ToggleForm toolKey={tool.key} saved={false}>
                    + Add
                  </ToggleForm>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

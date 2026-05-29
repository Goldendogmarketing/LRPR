import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertResourceAction, deleteResourceAction } from "./actions";

export const metadata = {
  title: "Admin Local Resources | LRPR",
  description:
    "Admin-added local resource data scaffold for Lake Region Property Resource.",
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
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const resourceTypes = [
  "City contacts",
  "County offices",
  "Utilities",
  "Permits and zoning",
  "Schools",
  "Parks and lakes",
  "Flood and parcel links",
  "Local guides",
];

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
        <Header />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-lg font-bold text-red-600">Admin only.</p>
        </section>
      </main>
    );
  }

  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : undefined;
  const saved = sp.saved === "1";
  const errorMsg = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("local_resources")
    .select("*")
    .order("updated_at", { ascending: false });

  const resources: LocalResourceRow[] = rows ?? [];
  const editRow = editId ? resources.find((r) => r.id === editId) : undefined;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="rounded-[2.5rem] bg-cyan-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            Admin added data
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Local resources are curated by LRPR admin.
          </h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-cyan-50/85">
            City/county resources, utilities, public data links, parks, lakes,
            schools, permits, and guides should be added from admin-curated
            sources rather than a public submission form.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-cyan-950"
            >
              Back to admin queue
            </Link>
            <Link
              href="/resources"
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15"
            >
              View public resources
            </Link>
          </div>
        </div>

        {/* Banners */}
        {saved && (
          <div className="mt-6 rounded-2xl bg-green-50 px-5 py-4 text-sm font-bold text-green-800 ring-1 ring-green-200">
            Resource saved successfully.
          </div>
        )}
        {errorMsg && (
          <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-800 ring-1 ring-red-200">
            Error: {errorMsg}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Create / Edit form */}
          <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
              {editRow ? "Editing resource" : "Add new resource"}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              {editRow ? editRow.title : "New local resource"}
            </h2>

            <form action={upsertResourceAction} className="mt-6 space-y-4">
              {editRow && (
                <input type="hidden" name="id" value={editRow.id} />
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Title *
                </label>
                <input
                  required
                  name="title"
                  type="text"
                  defaultValue={editRow?.title ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Resource type
                </label>
                <select
                  name="resource_type"
                  defaultValue={editRow?.resource_type ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">-- select type --</option>
                  {resourceTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                    City
                  </label>
                  <input
                    name="city"
                    type="text"
                    defaultValue={editRow?.city ?? ""}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                    County
                  </label>
                  <input
                    name="county"
                    type="text"
                    defaultValue={editRow?.county ?? ""}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Official URL
                </label>
                <input
                  name="official_url"
                  type="url"
                  defaultValue={editRow?.official_url ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Source name
                </label>
                <input
                  name="source_name"
                  type="text"
                  defaultValue={editRow?.source_name ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editRow?.notes ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="admin_approved"
                    defaultChecked={editRow?.admin_approved ?? false}
                    className="h-4 w-4 rounded border-slate-300 accent-cyan-600"
                  />
                  Admin approved
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-cyan-950 px-6 py-2.5 text-sm font-black text-white hover:bg-cyan-900"
                >
                  {editRow ? "Save changes" : "Add resource"}
                </button>
                {editRow && (
                  <Link
                    href="/admin/resources"
                    className="rounded-full bg-slate-100 px-6 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </Link>
                )}
              </div>
            </form>
          </section>

          {/* Existing rows */}
          <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
              Existing resources
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              {resources.length} record{resources.length !== 1 ? "s" : ""}
            </h2>

            {resources.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No resources yet. Add one with the form.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {resources.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {r.title ?? "(no title)"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {[r.resource_type, r.city, r.county]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.admin_approved ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-800">
                              Approved
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                              Not approved
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/admin/resources?edit=${r.id}`}
                          className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700 hover:bg-slate-300"
                        >
                          Edit
                        </Link>
                        <form action={deleteResourceAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

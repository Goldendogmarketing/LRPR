import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  upsertServiceProviderAction,
  deleteServiceProviderAction,
} from "./actions";

export const metadata = {
  title: "Admin Service Providers | LRPR",
  description:
    "Admin-uploaded, paywalled service-provider profile scaffold for Lake Region Property Resource.",
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
  payment_required: boolean | null;
  payment_complete: boolean | null;
  admin_approved: boolean | null;
  verified: boolean | null;
  sponsored: boolean | null;
  published_at: string | null;
  updated_at: string | null;
};

const providerCategories = [
  "Real estate agents",
  "Mortgage lenders",
  "Home inspectors",
  "Contractors",
  "Septic & well services",
  "Insurance agents",
  "Property management",
  "Surveyors",
  "Landscaping",
  "HVAC / Electrical",
  "Photographers",
  "Cleaning & staging",
];

export default async function AdminServiceProvidersPage({
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
    .from("service_provider_profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  const providers: ServiceProviderRow[] = rows ?? [];
  const editRow = editId ? providers.find((p) => p.id === editId) : undefined;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            Admin uploaded + paywall
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Service-provider profiles are controlled by LRPR admin.
          </h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-300">
            Public users do not submit vendor profiles from the property intake
            form. LRPR admin creates paid or admin-waived service-provider
            records, verifies the business, then approves the page before
            publishing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              Back to admin queue
            </Link>
            <Link
              href="/service-pros"
              className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15"
            >
              View public service pros
            </Link>
          </div>
        </div>

        {/* Banners */}
        {saved && (
          <div className="mt-6 rounded-2xl bg-green-50 px-5 py-4 text-sm font-bold text-green-800 ring-1 ring-green-200">
            Provider saved successfully.
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
              {editRow ? "Editing provider" : "Add new provider"}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              {editRow ? editRow.business_name : "New service provider"}
            </h2>

            <form action={upsertServiceProviderAction} className="mt-6 space-y-4">
              {editRow && (
                <input type="hidden" name="id" value={editRow.id} />
              )}

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Business name *
                </label>
                <input
                  required
                  name="business_name"
                  type="text"
                  defaultValue={editRow?.business_name ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editRow?.category ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">-- select category --</option>
                  {providerCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
                  Contact email
                </label>
                <input
                  name="contact_email"
                  type="email"
                  defaultValue={editRow?.contact_email ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Contact phone
                </label>
                <input
                  name="contact_phone"
                  type="tel"
                  defaultValue={editRow?.contact_phone ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-slate-600">
                  Website URL
                </label>
                <input
                  name="website_url"
                  type="url"
                  defaultValue={editRow?.website_url ?? ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="verified"
                    defaultChecked={editRow?.verified ?? false}
                    className="h-4 w-4 rounded border-slate-300 accent-cyan-600"
                  />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="sponsored"
                    defaultChecked={editRow?.sponsored ?? false}
                    className="h-4 w-4 rounded border-slate-300 accent-cyan-600"
                  />
                  Sponsored
                </label>
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
                  className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black text-white hover:bg-slate-800"
                >
                  {editRow ? "Save changes" : "Add provider"}
                </button>
                {editRow && (
                  <Link
                    href="/admin/service-providers"
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
              Existing providers
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
              {providers.length} record{providers.length !== 1 ? "s" : ""}
            </h2>

            {providers.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No providers yet. Add one with the form.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {providers.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {p.business_name ?? "(no name)"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {[p.category, p.city, p.county]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {p.admin_approved && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-800">
                              Approved
                            </span>
                          )}
                          {p.verified && (
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-black text-cyan-800">
                              Verified
                            </span>
                          )}
                          {p.sponsored && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                              Sponsored
                            </span>
                          )}
                          {!p.admin_approved && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                              Not approved
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/admin/service-providers?edit=${p.id}`}
                          className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700 hover:bg-slate-300"
                        >
                          Edit
                        </Link>
                        <form action={deleteServiceProviderAction}>
                          <input type="hidden" name="id" value={p.id} />
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

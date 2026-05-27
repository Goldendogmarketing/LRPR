import Link from "next/link";
import { Header } from "@/components/Header";

const providerCategories = [
  "Real estate agents",
  "Mortgage lenders",
  "Home inspectors",
  "Contractors",
  "Septic & well services",
  "Insurance agents",
  "Property management",
  "Surveyors",
];

const intakeFields = [
  "Business name, category, city/county coverage",
  "Contact phone, email, website, and service area",
  "Payment status or admin-waived sponsorship note",
  "License/insurance/source notes where applicable",
  "Admin approval before public service-pro page publish",
];

export const metadata = {
  title: "Admin Service Providers | LRPR",
  description: "Admin-uploaded, paywalled service-provider profile scaffold for Lake Region Property Resource.",
};

export default function AdminServiceProvidersPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Admin uploaded + paywall</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">Service-provider profiles are controlled by LRPR admin.</h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-300">Public users do not submit vendor profiles from the property intake form. LRPR admin creates paid or admin-waived service-provider records, verifies the business, then approves the page before publishing.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Back to admin queue</Link>
            <Link href="/service-pros" className="rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15">View public service pros</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Profile editor scaffold</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">Fields to wire when Supabase is live</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {intakeFields.map((field) => <div className="rounded-2xl bg-[#f8faf9] p-4 text-sm font-bold leading-6 text-slate-700" key={field}>✓ {field}</div>)}
            </div>
          </section>
          <aside className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Initial categories</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {providerCategories.map((category) => <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-900" key={category}>{category}</span>)}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

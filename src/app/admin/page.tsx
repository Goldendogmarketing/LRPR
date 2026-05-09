import Link from "next/link";
import { Header } from "@/components/Header";
import { adminDecisionAction } from "./actions";

const queueItems = [
  {
    id: "LRPR-1042",
    type: "Standard sale listing",
    title: "Lake Geneva Road home",
    submitter: "Owner submitted",
    city: "Keystone Heights",
    status: "Pending review",
    gates: ["Account validated", "Payment complete", "Permission needs proof", "Data enrichment queued"],
    priority: "High",
  },
  {
    id: "LRPR-1043",
    type: "Rental listing",
    title: "Starke rental packet",
    submitter: "Property manager submitted",
    city: "Starke",
    status: "Payment pending",
    gates: ["Account validated", "Payment pending", "Photos needed", "Manager contact verified"],
    priority: "Medium",
  },
  {
    id: "LRPR-1044",
    type: "Vendor / Service Pro profile",
    title: "Septic & well service profile",
    submitter: "Vendor submitted",
    city: "Melrose",
    status: "Changes requested",
    gates: ["Account validated", "Payment complete", "License/source review", "Category placement pending"],
    priority: "Medium",
  },
];

const workflowStats = [
  ["Pending review", "12", "Needs admin decision"],
  ["Payment pending", "5", "Stripe checkout not complete"],
  ["Changes requested", "4", "Waiting on submitter"],
  ["Publish ready", "3", "Passed all gates"],
];

const checklist = [
  "Account/email validated",
  "Payment complete or waived",
  "Permission/source documented",
  "Photos and copy safe to publish",
  "Parcel/flood/Census enrichment queued",
  "Admin decision recorded",
];

export const metadata = {
  title: "LRPR Admin Approval Queue | Lake Region Property Resource",
  description: "Admin approval workflow scaffold for Lake Region Property Resource submissions.",
};

type AdminPageProps = {
  searchParams?: Promise<{ decision?: string; submission?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const decision = params?.decision;
  const submission = params?.submission;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Admin infrastructure scaffold</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Approval queue for trusted local inventory.</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">This dashboard is the blueprint for the database-backed review queue: account validation, paid submission checks, source verification, enrichment, and final publishing.</p>
          </div>
          <Link href="/submit-listing" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15">Open submission page</Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {decision && submission ? (
            <div className="rounded-3xl bg-emerald-50 p-5 text-sm font-bold text-emerald-950 ring-1 ring-emerald-100 md:col-span-4">
              Admin action scaffold recorded: <span className="font-black">{decision}</span> for <span className="font-black">{submission}</span>. Real version will persist this to Supabase and queue Resend updates.
            </div>
          ) : null}
          {workflowStats.map(([label, value, note]) => (
            <article className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" key={label}>
              <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
              <h2 className="mt-2 font-black text-slate-800">{label}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{note}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.35fr]">
          <section className="rounded-[2rem] bg-white p-5 ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Queue</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Submissions needing review</h2>
              </div>
              <span className="rounded-full bg-cyan-50 px-4 py-2 text-xs font-black uppercase text-cyan-900">Static mock → database next</span>
            </div>
            <div className="mt-5 space-y-4">
              {queueItems.map((item) => (
                <article className="rounded-3xl border border-slate-200 bg-[#fbfaf7] p-5" key={item.id}>
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase text-white">{item.id}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-cyan-800 ring-1 ring-slate-200">{item.type}</span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-900">{item.priority}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-black text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{item.submitter} · {item.city} · {item.status}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.gates.map((gate) => <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200" key={gate}>{gate}</span>)}
                      </div>
                    </div>
                    <form action={adminDecisionAction} className="grid min-w-44 gap-2">
                      <input type="hidden" name="submissionId" value={item.id} />
                      <button name="decision" value="approved" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Review / approve</button>
                      <button name="decision" value="changes_requested" className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">Request changes</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-cyan-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Publish gate</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Nothing publishes automatically.</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-cyan-50/85">Submissions can be paid and still stay private until admin approval, source checks, and data enrichment are complete.</p>
            </section>
            <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Review checklist</p>
              <div className="mt-4 space-y-3">
                {checklist.map((item) => <div className="rounded-2xl bg-[#f8faf9] p-3 text-sm font-bold text-slate-700" key={item}>✓ {item}</div>)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

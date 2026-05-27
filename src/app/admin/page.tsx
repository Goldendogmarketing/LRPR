import Link from "next/link";
import { Header } from "@/components/Header";
import {
  createSupabaseServerClient,
  type SubmissionRow,
} from "@/lib/supabase/server";
import { adminDecisionAction } from "./actions";

const checklist = [
  "Account/email validated",
  "Payment complete or waived",
  "Permission/source documented",
  "Photos and copy safe to publish",
  "Parcel/flood/Census enrichment queued",
  "Admin decision recorded",
];

const submissionTypeLabel: Record<SubmissionRow["submission_type"], string> = {
  "residential-sale": "Residential sale",
  "land-listing": "Land / lot",
  "rental-listing": "Rental",
};

const statusLabel: Record<SubmissionRow["status"], string> = {
  draft: "Draft",
  account_pending: "Account pending",
  payment_pending: "Payment pending",
  pending_review: "Pending review",
  changes_requested: "Changes requested",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

export const metadata = {
  title: "LRPR Admin Approval Queue | Lake Region Property Resource",
  description:
    "Admin approval workflow for Lake Region Property Resource submissions.",
};

// Force dynamic rendering — this page reads live DB rows.
export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    decision?: string;
    submission?: string;
    status?: string;
  }>;
};

function buildGates(row: SubmissionRow): string[] {
  return [
    row.account_validated ? "Account validated" : "Account validation needed",
    row.payment_required
      ? row.payment_complete
        ? "Payment complete"
        : "Payment pending"
      : "Payment not required",
    row.permission_confirmed
      ? "Permission confirmed"
      : "Permission needs proof",
    row.admin_approved ? "Admin approved" : "Admin review pending",
  ];
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const decision = params?.decision;
  const submission = params?.submission;
  const status = params?.status;

  const supabase = createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const submissions = (rows ?? []) as SubmissionRow[];

  // Compute live workflow stats from real data.
  const stats = {
    pending_review: submissions.filter((s) => s.status === "pending_review")
      .length,
    account_pending: submissions.filter((s) => s.status === "account_pending")
      .length,
    changes_requested: submissions.filter(
      (s) => s.status === "changes_requested",
    ).length,
    publish_ready: submissions.filter(
      (s) =>
        s.account_validated &&
        (!s.payment_required || s.payment_complete) &&
        s.admin_approved &&
        s.permission_confirmed,
    ).length,
  };

  const workflowStats: Array<[string, string, string]> = [
    [
      "Pending review",
      String(stats.pending_review),
      "Needs admin decision",
    ],
    [
      "Account pending",
      String(stats.account_pending),
      "Waiting on validated submitter account",
    ],
    [
      "Changes requested",
      String(stats.changes_requested),
      "Waiting on submitter",
    ],
    ["Publish ready", String(stats.publish_ready), "Passed all gates"],
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Admin queue · live database
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Approval queue for trusted local inventory.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Live submissions from Supabase. Account validation, paid
              submission checks, source verification, enrichment, and final
              publishing all gate the publish state.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/submit-listing"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15"
            >
              Open property intake
            </Link>
            <Link
              href="/admin/service-providers"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200"
            >
              Service providers
            </Link>
            <Link
              href="/admin/resources"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200"
            >
              Local resources
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {decision && submission ? (
            <div className="rounded-3xl bg-emerald-50 p-5 text-sm font-bold text-emerald-950 ring-1 ring-emerald-100 md:col-span-4">
              Admin action scaffold recorded:{" "}
              <span className="font-black">{decision}</span> for{" "}
              <span className="font-black">{submission}</span>
              {status ? (
                <>
                  {" "}
                  · next status:{" "}
                  <span className="font-black">{status}</span>
                </>
              ) : null}
              .
            </div>
          ) : null}
          {error ? (
            <div className="rounded-3xl bg-rose-50 p-5 text-sm font-bold text-rose-950 ring-1 ring-rose-100 md:col-span-4">
              Database error: {error.message}
            </div>
          ) : null}
          {workflowStats.map(([label, value, note]) => (
            <article
              className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"
              key={label}
            >
              <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                {value}
              </p>
              <h2 className="mt-2 font-black text-slate-800">{label}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {note}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.35fr]">
          <section className="rounded-[2rem] bg-white p-5 ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                  Queue
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">
                  {submissions.length === 0
                    ? "No submissions yet"
                    : `${submissions.length} submission${submissions.length === 1 ? "" : "s"} in the queue`}
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase text-emerald-900">
                Live · Supabase
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {submissions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-[#fbfaf7] p-8 text-center">
                  <p className="text-sm font-bold text-slate-600">
                    The queue is empty. Submit a test listing at{" "}
                    <Link
                      href="/submit-listing"
                      className="font-black text-cyan-800 underline"
                    >
                      /submit-listing
                    </Link>{" "}
                    to see it appear here.
                  </p>
                </div>
              ) : (
                submissions.map((row) => {
                  const gates = buildGates(row);
                  const shortId = row.id.slice(0, 8);
                  return (
                    <article
                      className="rounded-3xl border border-slate-200 bg-[#fbfaf7] p-5"
                      key={row.id}
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase text-white">
                              {shortId}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-cyan-800 ring-1 ring-slate-200">
                              {submissionTypeLabel[row.submission_type]}
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase text-amber-900">
                              {statusLabel[row.status]}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-black text-slate-950">
                            {row.address_line || row.contact_name || "Untitled submission"}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {row.contact_name ?? "Anonymous"} ·{" "}
                            {row.contact_email ?? "no contact"} ·{" "}
                            {new Date(row.created_at).toLocaleString()}
                          </p>
                          {row.notes ? (
                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
                              {row.notes}
                            </p>
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {gates.map((gate) => (
                              <span
                                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                                key={gate}
                              >
                                {gate}
                              </span>
                            ))}
                          </div>
                        </div>
                        <form
                          action={adminDecisionAction}
                          className="grid min-w-44 gap-2"
                        >
                          <input
                            type="hidden"
                            name="submissionId"
                            value={row.id}
                          />
                          <textarea
                            name="notes"
                            placeholder="Review notes"
                            className="min-h-20 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                          />
                          <button
                            name="decision"
                            value="approved"
                            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
                          >
                            Review / approve
                          </button>
                          <button
                            name="decision"
                            value="changes_requested"
                            className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200"
                          >
                            Request changes
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-cyan-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                Publish gate
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                Nothing publishes automatically.
              </h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-cyan-50/85">
                Submissions can be paid and still stay private until admin
                approval, source checks, and data enrichment are complete.
              </p>
            </section>
            <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                Review checklist
              </p>
              <div className="mt-4 space-y-3">
                {checklist.map((item) => (
                  <div
                    className="rounded-2xl bg-[#f8faf9] p-3 text-sm font-bold text-slate-700"
                    key={item}
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

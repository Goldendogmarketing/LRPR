import { Header } from "@/components/Header";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Lake Region Property Resource.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Last updated {new Date().getFullYear()}
        </p>

        <div className="mt-8 space-y-6 text-base leading-7 text-slate-700">
          <p>
            By accessing or using Lake Region Property Resource, you agree to
            these terms. Please read them carefully.
          </p>
          <div>
            <h2 className="text-xl font-black text-slate-950">Use of the site</h2>
            <p className="mt-2">
              The site provides local property listings, resources, and service
              provider information. You agree to use it lawfully and not to
              submit false, misleading, or unauthorized listings.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Listings &amp; content</h2>
            <p className="mt-2">
              Listing and resource content is provided for informational
              purposes. We do not guarantee the accuracy of third-party or
              public-data information and are not a party to any transaction
              between users.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Changes</h2>
            <p className="mt-2">
              We may update these terms over time. This page is a placeholder
              and will be replaced with finalized terms before public launch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

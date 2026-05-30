import { Header } from "@/components/Header";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Lake Region Property Resource collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Last updated {new Date().getFullYear()}
        </p>

        <div className="mt-8 space-y-6 text-base leading-7 text-slate-700">
          <p>
            Lake Region Property Resource (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This policy explains what
            information we collect when you use our website and how we use it.
          </p>
          <div>
            <h2 className="text-xl font-black text-slate-950">Information we collect</h2>
            <p className="mt-2">
              We collect information you provide directly &mdash; such as your
              name, email, and listing details when you submit a property or
              create an account &mdash; along with basic, non-identifying usage
              data to improve the site.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">How we use information</h2>
            <p className="mt-2">
              We use your information to operate the listing portal, respond to
              inquiries, process submissions and payments, and provide local
              property resources. We do not sell your personal information.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Contact</h2>
            <p className="mt-2">
              Questions about this policy can be directed to the site
              administrator. This page is a placeholder and will be replaced
              with a finalized policy before public launch.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

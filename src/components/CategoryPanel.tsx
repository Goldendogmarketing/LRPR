import Link from "next/link";

export function CategoryPanel({ eyebrow, title, copy, categories, basePath }: { eyebrow: string; title: string; copy: string; categories: string[]; basePath: string }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <Link className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-black text-slate-800 transition hover:border-cyan-700 hover:bg-cyan-50" href={`${basePath}#${category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-").replaceAll("/", "")}`} key={category}>
            {category}
          </Link>
        ))}
      </div>
    </article>
  );
}

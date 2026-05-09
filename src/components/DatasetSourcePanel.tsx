import { DatasetSource } from "@/data/datasets";

export function DatasetSourcePanel({
  title = "Programmatic local data sources",
  sources,
  limit = 6,
}: {
  title?: string;
  sources: DatasetSource[];
  limit?: number;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Thin-content protection</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        These official datasets can be normalized into unique city, county, listing, resource, and service-provider pages so LRPR is useful instead of repeating thin template content.
      </p>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {sources.slice(0, limit).map((source) => (
          <article className="rounded-3xl bg-[#f7f3eb] p-5" key={source.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase text-white">{source.sourceType}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-slate-600">{source.cadence}</span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{source.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{source.contentUse}</p>
            <a className="mt-3 inline-block text-sm font-black text-cyan-800" href={source.url} target="_blank" rel="noreferrer">Official source →</a>
          </article>
        ))}
      </div>
    </section>
  );
}

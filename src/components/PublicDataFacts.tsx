import type { PublicDataFact } from "@/lib/public-data-enrichment";

type PublicDataFactsProps = {
  title: string;
  description?: string;
  facts: PublicDataFact[];
  generatedAt?: string;
};

export function PublicDataFacts({ title, description, facts, generatedAt }: PublicDataFactsProps) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-[2rem] bg-cyan-950 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Public data enrichment</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-50/85">{description}</p> : null}
        </div>
        {generatedAt ? <p className="text-xs font-bold text-cyan-100/70">Cache: {new Date(generatedAt).toLocaleDateString("en-US")}</p> : null}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {facts.map((fact) => (
          <article className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10" key={`${fact.label}-${fact.sourceName}`}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{fact.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/90">{fact.value}</p>
            <a className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.12em] text-cyan-100 underline decoration-cyan-300/60 underline-offset-4" href={fact.sourceUrl} target="_blank" rel="noreferrer">
              Source: {fact.sourceName}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

import { DatasetSourcePanel } from "@/components/DatasetSourcePanel";
import { Header } from "@/components/Header";
import { InternalLinkHub } from "@/components/InternalLinkHub";
import { datasetSources } from "@/data/datasets";

export const metadata = {
  title: "LRPR Public Data Sources | Florida Lake Region SEO Enrichment",
  description: "Official public datasets and APIs used to enrich Lake Region Property Resource pages for Keystone Heights, Starke, Melrose, Hawthorne, Interlachen, Florahome, and Hampton.",
};

export default function DataSourcesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3eb] text-slate-950">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-800">Data sources</p>
        <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight sm:text-6xl">Official datasets for useful Florida Lake Region pages.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          LRPR should avoid thin duplicate city pages by programmatically adding factual, sourced local context: Census, parcels, flood zones, schools, roads, lakes, utilities, weather, and official contacts.
        </p>
        <div className="mt-8">
          <DatasetSourcePanel title="Dataset registry for LRPR enrichment" sources={datasetSources} limit={datasetSources.length} />
        </div>
      </section>
      <InternalLinkHub />
    </main>
  );
}

import { datasetSources } from "@/data/datasets";

export type EnrichedDatasetSummary = {
  id: string;
  title: string;
  sourceUrl: string;
  fact: string;
};

/**
 * Placeholder enrichment layer.
 *
 * Real ingestion should run server-side on a schedule, cache normalized records in Postgres/Supabase,
 * and expose small page-ready summaries to avoid slow page renders and API rate-limit issues.
 */
export function getDatasetSummariesForPage(scope: "listing" | "city" | "county" | "resource" | "service-pro"): EnrichedDatasetSummary[] {
  return datasetSources
    .filter((source) => source.enriches.includes(scope))
    .slice(0, 5)
    .map((source) => ({
      id: source.id,
      title: source.name,
      sourceUrl: source.url,
      fact: source.contentUse,
    }));
}

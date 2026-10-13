import type { Metadata } from "next";
import Home from "@/content/home/home";
import { UrlParams } from "@/types";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";
import { getJobs } from "@/requests/jobs";

const normalizeParams = (
  raw: Record<string, string | string[] | undefined>,
): UrlParams =>
  Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

// Filtered views (?company=, ?industry=, ?search=) are subsets of the same
// dataset, not distinct content, so every variant's canonical still points
// at "/" — avoids Google indexing (and splitting ranking across) thousands
// of near-duplicate filter combinations. The title/description still vary
// per filter, which is what actually matters for anyone who shares a
// filtered link directly (link previews, browser tab).
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = normalizeParams(await searchParams);

  const filterLabel = params.company || params.industry || params.search;
  if (!filterLabel) return defaultMetaData();

  const title = `${filterLabel} Jobs | ${metaTitle}`;
  const description = `Job openings matching "${filterLabel}" — found via BGH Scout, aggregated from employer career pages and other public sources.`;

  return defaultMetaData(title, description, metaUrl);
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  // The query the API needs (page, filters, sort) only exists once
  // searchParams resolves, so this fetch is necessarily discovered after that
  // Request-time API — Next.js's fetch cache doesn't apply here. That's fine:
  // the API now does an indexed, per-page Postgres query instead of returning
  // the whole dataset, so every request is cheap regardless of caching.
  const params = normalizeParams(await searchParams);
  const csvData = await getJobs(params);

  return <Home csvData={csvData} />;
};

export default Page;

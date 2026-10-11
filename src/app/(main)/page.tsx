import type { Metadata } from "next";
import Home from "@/content/home/home";
import { AllSearchData, CsvData, Facet, UrlParams } from "@/types";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const JOBS_PER_PAGE = 18;

// The BGH Scout API filters, sorts, facets, and paginates in Postgres and
// returns only the page of jobs the browser will actually render.
interface JobsApiResponse {
  meta: { generatedAt: string; sourceScrapedAt: string | null };
  jobs: CsvData[];
  total: number;
  totalPages: number;
  page: number;
  companies: Facet[];
  industries: Facet[];
  scrapDates: string[];
}

const normalizeParams = (
  raw: Record<string, string | string[] | undefined>,
): UrlParams =>
  Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

const buildQuery = (params: UrlParams): string => {
  const query = new URLSearchParams({ limit: String(JOBS_PER_PAGE) });

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }

  return query.toString();
};

const fetchJobs = async (params: UrlParams): Promise<AllSearchData> => {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — cannot load job data.",
    );
  }

  const res = await fetch(`${API_BASE_URL}/v1/jobs?${buildQuery(params)}`, {
    next: { tags: ["leads"], revalidate: 900 },
  });

  if (!res.ok) {
    throw new Error(`Job API responded with ${res.status}`);
  }

  const body = (await res.json()) as JobsApiResponse;

  return {
    data: Array.isArray(body.jobs) ? body.jobs : [],
    total: body.total,
    totalPages: body.totalPages,
    page: body.page,
    refreshedAt: body.meta.sourceScrapedAt ?? "",
    scrapDates: body.scrapDates,
    companies: body.companies,
    industries: body.industries,
  };
};

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
  const csvData = await fetchJobs(params);

  return <Home csvData={csvData} />;
};

export default Page;

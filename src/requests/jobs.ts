import { AllSearchData, CsvData, Facet, UrlParams } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEFAULT_JOBS_PER_PAGE = 18;

// The BGH Scout API filters, sorts, facets, and paginates in Postgres and
// returns only the page of jobs the caller will actually render.
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

const buildQuery = (params: UrlParams, limit: number): string => {
  const query = new URLSearchParams({ limit: String(limit) });

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }

  return query.toString();
};

/**
 * Fetches one page of jobs matching `params` (the same `UrlParams` shape the
 * query string uses) — shared by the home page, company profile pages, and
 * anything else that needs a filtered slice of the job board. `limit`
 * defaults to the home page's page size but callers needing a small/large
 * batch (e.g. similar jobs, the companies facet) can override it.
 */
export const getJobs = async (
  params: UrlParams,
  limit = DEFAULT_JOBS_PER_PAGE,
): Promise<AllSearchData> => {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — cannot load job data.",
    );
  }

  const res = await fetch(`${API_BASE_URL}/v1/jobs?${buildQuery(params, limit)}`, {
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

/**
 * Fetches a single job by its stable id for the /jobs/[id] detail page.
 *
 * Not yet implemented by the API — see BACKEND_REPO_PLAN.md §5 for the
 * `GET /v1/jobs/:id` contract this expects. Until that ships, every id is a
 * 404 and the detail page renders its not-found state, same as it would for
 * a stale/bad link once the endpoint exists.
 *
 * Same cache tag/revalidate window as the list endpoint (`src/app/page.tsx`)
 * since both read the same underlying dataset on the same ingest cadence.
 */
export const getJobById = async (id: string): Promise<CsvData | null> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot load job.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/jobs/${encodeURIComponent(id)}`, {
    next: { tags: ["leads"], revalidate: 900 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Job API responded with ${res.status}`);
  }

  return (await res.json()) as CsvData;
};

/**
 * The full companies facet (every company with at least one open job, across
 * the whole dataset — not just one search's results), for the `/companies`
 * browse page. `limit: 1` keeps the response small since only `companies`
 * is used, not `jobs`.
 */
export const getCompanies = async (): Promise<Facet[]> => {
  const { companies } = await getJobs({}, 1);
  return [...companies].sort((a, b) => a.value.localeCompare(b.value));
};

/**
 * A handful of other open roles in the same industry as `job`, for the
 * "Similar Jobs" section on the /jobs/[id] detail page. Reuses the existing
 * `/v1/jobs` filter rather than needing a dedicated similarity endpoint.
 *
 * This is a nice-to-have enhancement, not critical path — any failure (API
 * down, job missing its industry) degrades to "no similar jobs shown"
 * rather than failing the job page itself.
 */
export const getSimilarJobs = async (
  job: CsvData,
  limit = 4,
): Promise<CsvData[]> => {
  if (!job["Primary Industry"]) return [];

  try {
    const { data } = await getJobs(
      { industry: job["Primary Industry"], sort: "most" },
      limit + 1,
    );

    return data.filter((item) => item.Link !== job.Link).slice(0, limit);
  } catch {
    return [];
  }
};

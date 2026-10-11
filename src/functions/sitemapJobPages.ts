import { CsvData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Shared between app/sitemap.ts (which generates each job sitemap chunk)
// and app/robots.ts (which has to list every chunk's URL so crawlers that
// only read the one `Sitemap:` hint still find all of them) — kept in one
// place so the two can never disagree on how many chunks there are.
//
// `/v1/jobs`'s `limit` is clamped to 50 server-side (BACKEND_REPO_PLAN.md
// §5), so this can't be the usual "fewer, bigger pages" trade-off a sitemap
// generator would otherwise make — it's stuck at the UI's own page size.
// That means one sitemap chunk per 50 jobs, well under Google's
// 50,000-URL-per-sitemap limit, but a lot of small requests for a large
// dataset. Flagged in BACKEND_REPO_PLAN.md as something the API should
// probably special-case (a higher limit, or a dedicated ids-only endpoint)
// once real job volume makes that a real cost.
export const JOBS_PER_SITEMAP_PAGE = 50;

export interface JobsPage {
  jobs: CsvData[];
  totalPages: number;
}

const EMPTY_PAGE: JobsPage = { jobs: [], totalPages: 0 };

// Sitemaps and robots.txt are nice-to-haves, not critical path — an API
// hiccup (or the backend being unreachable at build time) must never fail
// `next build` or take either route down. Every failure mode here degrades
// to "no job entries this round" rather than throwing.
export const fetchJobsPageForSitemap = async (
  page: number,
): Promise<JobsPage> => {
  if (!API_BASE_URL) return EMPTY_PAGE;

  try {
    const res = await fetch(
      `${API_BASE_URL}/v1/jobs?page=${page}&limit=${JOBS_PER_SITEMAP_PAGE}`,
      { next: { tags: ["leads"], revalidate: 900 } },
    );

    if (!res.ok) return EMPTY_PAGE;

    const body = await res.json();
    return {
      jobs: Array.isArray(body.jobs) ? body.jobs : [],
      totalPages: typeof body.totalPages === "number" ? body.totalPages : 0,
    };
  } catch {
    return EMPTY_PAGE;
  }
};

import { CsvData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

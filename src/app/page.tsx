import Home from "../content/home/home";
import { CsvData, UrlParams } from "@/types";
import { filterJobs } from "@/functions/filterJobs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// The BGH Scout API reads the Google Sheet CSV, dedupes it, sanitizes and
// enriches every job with its "additional details" (schema.org/JobPosting
// JSON-LD), and returns the whole enriched dataset in one response.
interface JobsResponse {
  jobs: CsvData[];
}

const fetchJobs = async (): Promise<CsvData[]> => {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — cannot load job data.",
    );
  }

  const res = await fetch(`${API_BASE_URL}/v1/jobs`, {
    next: { tags: ["leads"], revalidate: 900 },
  });

  if (!res.ok) {
    throw new Error(`Job API responded with ${res.status}`);
  }

  const body = (await res.json()) as JobsResponse;

  return Array.isArray(body.jobs) ? body.jobs : [];
};

const normalizeParams = (
  raw: Record<string, string | string[] | undefined>,
): UrlParams =>
  Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = normalizeParams(await searchParams);
  const jobs = await fetchJobs();

  return <Home csvData={filterJobs(jobs, params)} />;
};

export default Page;

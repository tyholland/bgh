export interface JobDetails {
  datePosted: string;
  description: string;
  employmentType: string;
  jobLocation: {
    address: {
      addressLocality: string;
    };
  };
  validThrough?: string;
  jobBenefits?: string;
}

export interface CsvData {
  "Role Name": string;
  "Primary Industry": string;
  Scrape_DateTime: string;
  Scrape_Date: string;
  Company: string;
  Link: string;
  Details?: JobDetails;
  // Stable per-job identifier used to build /jobs/[id] detail-page URLs.
  // Optional until the API ships it (see BACKEND_REPO_PLAN.md §5) — anything
  // reading this field must handle it being absent and degrade gracefully
  // (e.g. skip rendering a link to the detail page) rather than assume it's
  // always present.
  id?: string;
  // All-time view count for this job, only ever present on the single-job
  // response (GET /v1/jobs/:id) — see the backend's job_view_counts table.
  viewCount?: number;
}

// Query-string params for the job board. Everything arrives as a string (or is
// absent), so every field is optional.
export interface UrlParams {
  page?: string;
  search?: string;
  company?: string;
  date?: string;
  exact?: string;
  keyword?: string;
  industry?: string;
  sort?: string;
}

// A filterable value plus how many jobs currently match it.
export interface Facet {
  value: string;
  count: number;
}

// The server-filtered payload handed to the client. Only the current page of
// results is included — the full dataset never reaches the browser.
export interface AllSearchData {
  data: CsvData[];
  total: number;
  totalPages: number;
  page: number;
  refreshedAt: string;
  scrapDates: string[];
  companies: Facet[];
  industries: Facet[];
}

export interface PaginationClick {
  selected: number;
}

export interface User {
  email: string | null;
  providerId: string;
  uid: string;
  phoneNumber: string | null;
  photoURL: string | null;
  displayName: string | null;
}

export type ElementSize = "small" | "medium" | "large";

// A user's saved search — the filter criteria only, not the page number.
export type SavedSearchParams = Omit<UrlParams, "page">;

// Whether — and how often — this saved search emails the user when new jobs
// match it. "off" (the default) means it behaves exactly like a saved search
// did before alerts existed: just a shortcut back to these filters.
export type AlertFrequency = "off" | "daily" | "weekly";

export interface SavedSearch {
  id: string;
  uid: string;
  name: string | null;
  params: SavedSearchParams;
  alertFrequency: AlertFrequency;
  createdAt: string;
}

// A user's bookmark of a single job — denormalized (role/company/link
// captured at save time) so it keeps rendering even if the live job later
// disappears (delisted, or briefly gone around the backend's daily ingest
// clear — see bgh_node's 007_saved_jobs.sql).
export interface SavedJob {
  id: string;
  uid: string;
  jobId: string;
  roleName: string;
  company: string | null;
  link: string;
  createdAt: string;
}

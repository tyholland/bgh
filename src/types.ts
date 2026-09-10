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

export interface CsvData {
  "Role Name": string;
  "Primary Industry": string;
  Scrape_DateTime: string;
  Scrape_Date: string;
  Company: string;
  Link: string;
}

export interface UrlParams {
  page: number;
  search: string;
  company: string;
  date: string;
  exact: string;
  keyword: string;
  industry: string;
}

export interface AllSearchData {
  data: CsvData[];
  allData: CsvData[];
  total: number;
  totalPages: number;
  scrapDates: string[];
  companies: string[];
  industries: string[];
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

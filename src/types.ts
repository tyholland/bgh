export interface CsvData {
  "Role Name": string;
  Scrape_Date: string;
  Company: string;
  Link: string;
}

export interface UrlParams {
  page: number;
  search: string;
  company: string;
  date: string;
  keyword: string;
}

export interface AllSearchData {
  data: CsvData[];
  allData: CsvData[];
  total: number;
  page: number;
  totalPages: number;
  companies: string[];
  scrapDates: string[];
}

import { AllSearchData, CsvData, Facet, UrlParams } from "@/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const JOBS_PER_PAGE = 18;

// Formats the scrape sheet / URL params are known to produce.
const DATE_FORMATS = ["YYYY/MM/DD", "YYYY-MM-DD", "MM/DD/YYYY", "MM-DD-YYYY"];

const toTime = (value?: string) => (value ? dayjs(value).valueOf() : 0);

const toDay = (value?: string) => {
  if (!value) return null;
  const parsed = dayjs(value, DATE_FORMATS);
  return parsed.isValid() ? parsed.startOf("day") : null;
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const buildFacets = (
  rows: CsvData[],
  pick: (row: CsvData) => string | undefined,
): Facet[] => {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = pick(row);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
};

/**
 * The single source of truth for turning the full job list + query params into
 * a page of results. Runs on the server (initial render) only — the browser
 * receives just the returned page, never the full list.
 */
export const filterJobs = (
  rows: CsvData[],
  params: UrlParams,
): AllSearchData => {
  const search = params.search?.trim().toLowerCase() ?? "";
  const company = params.company?.trim() ?? "";
  const industry = params.industry?.trim() ?? "";
  const keyword = params.keyword?.trim() ?? "";
  const date = params.date?.trim() ?? "";
  const exact = params.exact?.trim() ?? "";
  const sort = params.sort?.trim() ?? "";
  const requestedPage = Math.max(1, Math.floor(Number(params.page) || 1));

  const refreshedAt = rows.reduce(
    (latest, row) =>
      toTime(row.Scrape_DateTime) > toTime(latest) ? row.Scrape_DateTime : latest,
    "",
  );

  // Filters that constrain the facet lists too (search / keyword / date).
  let base = rows;

  if (search) {
    base = base.filter((row) =>
      row["Role Name"]?.toLowerCase().includes(search),
    );
  }

  if (keyword) {
    const wanted = splitList(keyword);
    base = base.filter((row) => {
      const role = row["Role Name"]?.toLowerCase() ?? "";
      return wanted.some((entry) => role.includes(entry));
    });
  }

  if (exact) {
    const target = toDay(exact.replaceAll("-", "/"));
    base = target
      ? base.filter((row) => {
          const day = toDay(row.Scrape_Date);
          return day ? day.isSame(target, "day") : false;
        })
      : base;
  } else if (date) {
    const start = toDay(date);
    base = start
      ? base.filter((row) => {
          const day = toDay(row.Scrape_Date);
          return day ? !day.isBefore(start, "day") : false;
        })
      : base;
  }

  // Facets reflect everything except the company / industry selection itself,
  // so both lists stay usable while a filter is applied.
  const companies = buildFacets(base, (row) => row.Company);
  const industries = buildFacets(base, (row) => row["Primary Industry"]);
  const scrapDates = [
    ...new Set(base.map((row) => row.Scrape_Date).filter(Boolean)),
  ].sort((a, b) => b.localeCompare(a));

  let result = base;

  if (company) {
    const wanted = splitList(company);
    result = result.filter((row) =>
      wanted.includes(row.Company?.toLowerCase() ?? ""),
    );
  }

  if (industry) {
    const wanted = splitList(industry);
    result = result.filter((row) =>
      wanted.includes(row["Primary Industry"]?.toLowerCase() ?? ""),
    );
  }

  result = [...result].sort((a, b) => {
    switch (sort) {
      case "a":
        return (a["Role Name"] ?? "").localeCompare(b["Role Name"] ?? "");
      case "z":
        return (b["Role Name"] ?? "").localeCompare(a["Role Name"] ?? "");
      case "least":
        return toTime(a.Scrape_DateTime) - toTime(b.Scrape_DateTime);
      case "most":
      default:
        return toTime(b.Scrape_DateTime) - toTime(a.Scrape_DateTime);
    }
  });

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * JOBS_PER_PAGE;

  return {
    data: result.slice(start, start + JOBS_PER_PAGE),
    total,
    totalPages,
    page,
    refreshedAt,
    scrapDates,
    companies,
    industries,
  };
};

import { AllSearchData, CsvData } from "@/types";
import dayjs from "dayjs";

const limit = 18;

export const handleSearchParams = (
  searchData: AllSearchData,
  params: URLSearchParams,
  setData: (val: AllSearchData) => void,
) => {
  const search = params.get("search");
  const page = params.get("page") || 1;
  const company = params.get("company");
  const date = params.get("date");
  const exact = params.get("exact");
  const industry = params.get("industry");
  const keyword = params.get("keyword");

  let allData: CsvData[] = searchData.allData as CsvData[];

  allData = allData.filter((item: CsvData) =>
    item["Role Name"]?.toLowerCase().includes((search || "").toLowerCase()),
  );

  let filteredData: CsvData[] = allData.sort((a: CsvData, b: CsvData) => {
    const dateTime1 = a.Details?.datePosted || a.Scrape_DateTime;
    const dateTime2 = b.Details?.datePosted || b.Scrape_DateTime;

    const dateA = dateTime1 ? dayjs(dateTime1).unix() : 0;

    const dateB = dateTime2 ? dayjs(dateTime2).unix() : 0;

    return dateB - dateA;
  });

  if (company) {
    const companySplit = company.split(",").map((k) => k.trim().toLowerCase());

    filteredData = filteredData.filter((item: CsvData) =>
      companySplit.some((k) => item.Company?.toLowerCase() === k.toLowerCase()),
    );
  }

  if (industry) {
    const industrySplit = industry
      .split(",")
      .map((k) => k.trim().toLowerCase());

    filteredData = filteredData.filter((item: CsvData) =>
      industrySplit.some(
        (k) => item["Primary Industry"]?.toLowerCase() === k.toLowerCase(),
      ),
    );
  }

  if (keyword) {
    const keywordSplit = keyword.split(",").map((k) => k.trim().toLowerCase());

    filteredData = filteredData.filter((item: CsvData) =>
      keywordSplit.some((k) => item["Role Name"]?.toLowerCase().includes(k)),
    );
  }

  if (date) {
    const today = new Date().toDateString();
    const startDate = new Date(date).toDateString();

    filteredData = filteredData.filter((item: CsvData) => {
      const itemDate = new Date(
        item.Details?.datePosted || item.Scrape_Date,
      ).toDateString();

      return itemDate === today
        ? item
        : itemDate <= today && itemDate >= startDate;
    });
  }

  if (exact) {
    const exactDate = exact.replaceAll("-", "/");

    filteredData = filteredData.filter((item: CsvData) => {
      const itemDate = item.Details?.datePosted || item.Scrape_Date;

      return itemDate === exactDate;
    });
  }

  const start = (Number(page) - 1) * limit;
  const end = start + limit;

  const companies: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Company)),
  ];
  const scrapDates: string[] = [
    ...new Set(
      filteredData.map(
        (item: CsvData) => item.Details?.datePosted || item.Scrape_Date,
      ),
    ),
  ];
  const industries: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item["Primary Industry"])),
  ];

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort((a, b) => b.localeCompare(a)),
    industries: industries.sort(),
  });
};

<<<<<<< HEAD
export const getItemTotalCount = (
  job: string,
  type: string,
  allJobs?: CsvData[],
) => {
=======
export const getCompanyTotalCount = (company: string, allJobs?: CsvData[]) => {
>>>>>>> cee206c (testing refactored code)
  let count = 0;

  allJobs &&
    allJobs.forEach((item: CsvData) => {
<<<<<<< HEAD
      if (item["Primary Industry"] === job && type === "industry") {
        count++;
      }
      if (item.Company === job && type === "company") {
=======
      if (item.Company === company) {
>>>>>>> cee206c (testing refactored code)
        count++;
      }
    });

  return count;
};

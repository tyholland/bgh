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
    const dateA = a.Scrape_DateTime ? dayjs(a.Scrape_DateTime).unix() : 0;

    const dateB = b.Scrape_DateTime ? dayjs(b.Scrape_DateTime).unix() : 0;

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
    const today = new Date();
    const startDate = new Date(date);

    filteredData = filteredData.filter((item: CsvData) => {
      const itemDate = new Date(item.Scrape_DateTime);

      return itemDate === today
        ? item
        : itemDate <= today && itemDate >= startDate;
    });
  }

  if (exact) {
    const exactDate = new Date(exact);

    filteredData = filteredData.filter((item: CsvData) => {
      const itemDate = new Date(item.Scrape_Date);

      return itemDate.toDateString() === exactDate.toDateString();
    });
  }

  const start = (Number(page) - 1) * limit;
  const end = start + limit;

  const companies: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Company.toLowerCase())),
  ];
  const scrapDates: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Scrape_Date)),
  ];
  const industries: string[] = [
    ...new Set(
      filteredData.map((item: CsvData) =>
        item["Primary Industry"].toLowerCase(),
      ),
    ),
  ];

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort().map((str) =>
      str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" "),
    ),
    scrapDates: scrapDates.sort((a, b) => b.localeCompare(a)),
    industries: industries.sort().map((str) =>
      str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" "),
    ),
  });
};

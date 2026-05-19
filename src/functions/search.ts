import { AllSearchData, CsvData } from "@/types";

const limit = 18;

export const handleSearchParams = (
  searchData: AllSearchData,
  params: URLSearchParams,
  setData: (val: AllSearchData) => void,
) => {
  const search = params.get("search");
  const page = params.get("page");
  const company = params.get("company");
  const date = params.get("date");
  const industry = params.get("industry");
  const keyword = params.get("keyword");

  let allData: CsvData[] = searchData.allData as CsvData[];

  allData = allData.filter((item: CsvData) =>
    item["Role Name"]?.toLowerCase().includes((search || "").toLowerCase()),
  );

  let filteredData: CsvData[] = allData.sort((a: CsvData, b: CsvData) => {
    const dateA = a.Scrape_Date ? new Date(a.Scrape_Date).getTime() : 0;

    const dateB = b.Scrape_Date ? new Date(b.Scrape_Date).getTime() : 0;

    return dateB - dateA;
  });

  if (company) {
    filteredData = filteredData.filter(
      (item: CsvData) => item.Company?.toLowerCase() === company.toLowerCase(),
    );
  }

  if (industry) {
    filteredData = filteredData.filter(
      (item: CsvData) =>
        item["Primary Industry"]?.toLowerCase() === industry.toLowerCase(),
    );
  }

  if (keyword) {
    const keywordSplit = keyword.split(",").map((k) => k.trim().toLowerCase());

    filteredData = filteredData.filter((item: CsvData) =>
      keywordSplit.some((k) => item["Role Name"]?.toLowerCase().includes(k)),
    );
  }

  if (date) {
    filteredData = filteredData.filter(
      (item: CsvData) => item.Scrape_Date?.toLowerCase() === date.toLowerCase(),
    );
  }

  const start = (searchData.page - 1) * limit;
  const end = start + limit;

  const companies: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Company)),
  ];
  const scrapDates: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Scrape_Date)),
  ];
  const industries: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item["Primary Industry"])),
  ];

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    page: page ? Number(page) : 1,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort(),
    industries: industries.sort(),
  });
};

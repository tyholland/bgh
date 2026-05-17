import { AllSearchData, CsvData } from "@/types";

export const updateSearchParams = (
  searchData: AllSearchData,
  searchWord: string,
  setData: (val: AllSearchData) => void,
) => {
  const limit = 10;
  let allData: CsvData[] = searchData.allData as CsvData[];

  allData = allData.filter((item: CsvData) =>
    item["Role Name"]?.toLowerCase().includes(searchWord.toLowerCase()),
  );

  let filteredData: CsvData[] = allData.sort((a: any, b: any) => {
    return a.Scrape_Date - b.Scrape_Date;
  });

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
    page: searchData.page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort(),
    industries: industries.sort(),
  });
};

export const clearAllSearched = (
  searchData: AllSearchData,
  setData: (val: AllSearchData) => void,
) => {
  const limit = 10;
  const page = 1;

  let filteredData: CsvData[] = searchData.allData.sort((a: any, b: any) => {
    return a.Scrape_Date - b.Scrape_Date;
  });

  const start = (page - 1) * limit;
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
    ...searchData,
    data: filteredData.slice(start, end),
    total: filteredData.length,
    page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort(),
    industries: industries.sort(),
  });
};

export const filterJobSearch = (
  searchData: AllSearchData,
  params: URLSearchParams,
  setData: (val: AllSearchData) => void,
) => {
  const limit = 10;
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

  let filteredData: CsvData[] = allData.sort((a: any, b: any) => {
    return a.Scrape_Date - b.Scrape_Date;
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

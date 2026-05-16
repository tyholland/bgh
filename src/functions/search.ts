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

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    page: searchData.page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies,
    scrapDates,
  });
};

export const clearAllSearched = (
  searchData: AllSearchData,
  setData: (val: AllSearchData) => void,
) => {
  const limit = 10;
  const page = 1;
  const allData: CsvData[] = searchData.allData as CsvData[];

  let filteredData: CsvData[] = allData.sort((a: any, b: any) => {
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

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies,
    scrapDates,
  });
};

export const filterByCompany = (
  searchData: AllSearchData,
  filter: string,
  setData: (val: AllSearchData) => void,
) => {
  const limit = 10;
  const allData: CsvData[] = searchData.allData as CsvData[];

  let filteredData: CsvData[] = allData.sort((a: any, b: any) => {
    return a.Scrape_Date - b.Scrape_Date;
  });

  filteredData = filteredData.filter(
    (item: CsvData) => item.Company?.toLowerCase() === filter.toLowerCase(),
  );

  const start = (searchData.page - 1) * limit;
  const end = start + limit;

  const companies: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Company)),
  ];
  const scrapDates: string[] = [
    ...new Set(filteredData.map((item: CsvData) => item.Scrape_Date)),
  ];

  setData({
    data: filteredData.slice(start, end),
    allData: searchData.allData,
    total: filteredData.length,
    page: searchData.page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies,
    scrapDates,
  });
};

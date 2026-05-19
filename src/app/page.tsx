import Papa from "papaparse";
import Home from "../content/home/home";
import { CsvData, UrlParams } from "@/types";

const getCSVData = async (params: UrlParams, limit = 18) => {
  const { page: pageNum, search, company, date, keyword, industry } = params;
  const page = pageNum || 1;

  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCojX6uxGRp22IEXXnqLI4gHc9F26jyAwqhHlyaFh1_YbhQnWE-Dp6p-33liZXUjf4Ze4P5KbTwL3Y/pub?gid=1171311859&single=true&output=csv",
    {
      cache: "no-store",
    },
  );

  const csvText = await res.text();

  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  let allData: CsvData[] = parsedData.data as CsvData[];

  if (search) {
    allData = allData.filter((item: CsvData) =>
      item["Role Name"]?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  let filteredData = allData.sort((a: CsvData, b: CsvData) => {
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

  return {
    data: filteredData.slice(start, end),
    allData: parsedData.data as CsvData[],
    total: filteredData.length,
    page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort(),
    industries: industries.sort(),
  };
};

const Page = async ({ searchParams }: any) => {
  const params = await searchParams;
  const data = await getCSVData(params);

  return (
    <>
      <Home csvData={data} />
    </>
  );
};

export default Page;

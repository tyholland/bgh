import Papa from "papaparse";
import Home from "../content/home/home";
import { CsvData, UrlParams } from "@/types";
import dayjs from "dayjs";

const getCSVData = async (params: UrlParams, limit = 18) => {
  const {
    page: pageNum,
    search,
    company,
    date,
    exact,
    keyword,
    industry,
  } = params;
  const page = pageNum || 1;

  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWtRcbb_EAVdtXttu1a9auwcoh67J9kY92xsDf-zttSXKSrIq6olsZq5GI6gNgJ85119sgnpiVGNFy/pub?output=csv",
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

  const start = (page - 1) * limit;
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

  return {
    data: filteredData.slice(start, end),
    allData: parsedData.data as CsvData[],
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
  };
};

const Page = async ({ searchParams }: any) => {
  const params = await searchParams;
  const data = await getCSVData(params);

  return <Home csvData={data} />;
};

export default Page;

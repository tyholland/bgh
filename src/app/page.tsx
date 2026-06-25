import Papa from "papaparse";
import Home from "../content/home/home";
import { CsvData, UrlParams } from "@/types";
import dayjs from "dayjs";

const getAdditionalJobDetails = async (jobs: CsvData[]) => {
  await Promise.all(
    jobs.map(async (item) => {
      try {
        const res = await fetch(item.Link, {
          method: "GET",
          next: {
            tags: ["leads"],
          },
        });

        const html = await res.text();

        const scripts = [
          ...html.matchAll(
            /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
          ),
        ];

        for (const script of scripts) {
          const json = JSON.parse(script[1]);

          if (json["@type"] === "JobPosting") {
            item.Details = json;
            break;
          }
        }
      } catch (err) {
        console.error(`Failed to crawl ${item.Link}`, err);
      }
    }),
  );

  console.log("jobs:", jobs);
  return jobs;
};

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
      next: {
        tags: ["leads"],
      },
    },
  );

  const csvText = await res.text();

  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  let allData: CsvData[] = await getAdditionalJobDetails(
    parsedData.data as CsvData[],
  );

  if (search) {
    allData = allData.filter((item: CsvData) =>
      item["Role Name"]?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  let filteredData = allData.sort((a: CsvData, b: CsvData) => {
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

  const start = (page - 1) * limit;
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

  return {
    data: filteredData.slice(start, end),
    allData: await getAdditionalJobDetails(parsedData.data as CsvData[]),
    total: filteredData.length,
    totalPages: Math.ceil(filteredData.length / limit),
    companies: companies.sort(),
    scrapDates: scrapDates.sort((a, b) => b.localeCompare(a)),
    industries: industries.sort(),
  };
};

const Page = async ({ searchParams }: any) => {
  const params = await searchParams;
  const data = await getCSVData(params);

  return <Home csvData={data} />;
};

export default Page;

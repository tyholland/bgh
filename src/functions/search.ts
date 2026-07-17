import { AllSearchData, CsvData } from "@/types";
import dayjs from "dayjs";

const limit = 18;

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
          const jsonString = JSON.stringify(script[1]);
          const json = JSON.parse(jsonString);

          if (json["@type"] === "JobPosting") {
            item.Details = json;
            break;
          }
        }
      } catch (err) {
        console.warn(`Failed to crawl ${item.Link}`, err);
      }
    }),
  );

  return jobs;
};

export const handleSearchParams = (
  searchData: AllSearchData,
  params: URLSearchParams,
  setData: (val: AllSearchData) => void,
) => {
  (async () => {
    const search = params.get("search");
    const page = params.get("page") || 1;
    const company = params.get("company");
    const date = params.get("date");
    const exact = params.get("exact");
    const industry = params.get("industry");
    const keyword = params.get("keyword");
    const sort = params.get("sort");

    let allData: CsvData[] = searchData.allData as CsvData[];

    allData = allData.filter((item: CsvData) =>
      item["Role Name"]?.toLowerCase().includes((search || "").toLowerCase()),
    );

    let filteredData: CsvData[] = allData.sort((a: CsvData, b: CsvData) => {
      const dateTime1 = a.Scrape_DateTime;
      const dateTime2 = b.Scrape_DateTime;

      const dateA = dateTime1 ? dayjs(dateTime1).unix() : 0;

      const dateB = dateTime2 ? dayjs(dateTime2).unix() : 0;

      return dateB - dateA;
    });

    if (company) {
      const companySplit = company
        .split(",")
        .map((k) => k.trim().toLowerCase());

      filteredData = filteredData.filter((item: CsvData) =>
        companySplit.some(
          (k) => item.Company?.toLowerCase() === k.toLowerCase(),
        ),
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
      const keywordSplit = keyword
        .split(",")
        .map((k) => k.trim().toLowerCase());

      filteredData = filteredData.filter((item: CsvData) =>
        keywordSplit.some((k) => item["Role Name"]?.toLowerCase().includes(k)),
      );
    }

    if (date) {
      const today = new Date().toDateString();
      const startDate = new Date(date).toDateString();

      filteredData = filteredData.filter((item: CsvData) => {
        const itemDate = new Date(item.Scrape_Date).toDateString();

        return itemDate === today
          ? item
          : itemDate <= today && itemDate >= startDate;
      });
    }

    if (exact) {
      const exactDate = exact.replaceAll("-", "/");

      filteredData = filteredData.filter((item: CsvData) => {
        const itemDate = item.Scrape_Date;

        return itemDate === exactDate;
      });
    }

    const start = (Number(page) - 1) * limit;
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

    if (sort) {
      switch (sort) {
        case "a":
          filteredData.sort((a: CsvData, b: CsvData) => {
            return a["Role Name"].localeCompare(b["Role Name"]);
          });
          break;
        case "z":
          filteredData.sort((a: CsvData, b: CsvData) => {
            return b["Role Name"].localeCompare(a["Role Name"]);
          });
          break;
        default:
          filteredData.sort((a: CsvData, b: CsvData) => {
            return a["Role Name"].localeCompare(b["Role Name"]);
          });
          break;
      }
    }

    setData({
      data: filteredData.slice(start, end),
      allData: searchData.allData,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
      companies: companies.sort(),
      scrapDates: scrapDates.sort((a, b) => b.localeCompare(a)),
      industries: industries.sort(),
    });
  })();
};

export const getItemTotalCount = (
  job: string,
  type: string,
  allJobs?: CsvData[],
) => {
  let count = 0;

  allJobs &&
    allJobs.forEach((item: CsvData) => {
      if (item["Primary Industry"] === job && type === "industry") {
        count++;
      }
      if (item.Company === job && type === "company") {
        count++;
      }
    });

  return count;
};

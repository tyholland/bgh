import Papa from "papaparse";
import Home from "../content/home/home";

const getCSVData = async (params: any, limit = 10) => {
  const { page: pageNum, search, company, date } = params;
  const page = pageNum || 1;

  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQyHqBt_Nu24Rrfr26tI1nMCc7s2JYAb2Kxf61pYZKy3u-iYxjFrP3ivvzXMG5OM1EKLpwdCESBpq9R/pub?output=csv",
    {
      cache: "no-store",
    },
  );

  const csvText = await res.text();

  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  let allData = parsedData.data;

  if (search) {
    allData = allData.filter((item: any) =>
      item["Role Name"]?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  let filteredData = allData;

  if (company) {
    filteredData = filteredData.filter(
      (item: any) => item["Company"]?.toLowerCase() === company.toLowerCase(),
    );
  }

  if (date) {
    filteredData = filteredData.filter(
      (item: any) => item["Scrape_Date"]?.toLowerCase() === date.toLowerCase(),
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  const companies = [...new Set(filteredData.map((item: any) => item.Company))];
  const scrapDates = [
    ...new Set(filteredData.map((item: any) => item.Scrape_Date)),
  ];

  return {
    data: filteredData.slice(start, end),
    allData: filteredData,
    total: filteredData.length,
    page,
    totalPages: Math.ceil(filteredData.length / limit),
    companies,
    scrapDates,
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

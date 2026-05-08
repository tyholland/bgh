import Papa from "papaparse";
import Home from "../content/home/home";

const getCSVData = async (page = 1, search = "", limit = 10) => {
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
    allData = allData.filter(
      (item: any) =>
        item["Company"]?.toLowerCase().includes(search.toLowerCase()) ||
        item["Role Name"]?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: allData.slice(start, end),
    total: allData.length,
    page,
    totalPages: Math.ceil(allData.length / limit),
  };
};

const Page = async ({ searchParams }: any) => {
  const params = await searchParams;
  const data = await getCSVData(params.page, params.search);

  return (
    <>
      <Home csvData={data} />
    </>
  );
};

export default Page;

import Papa from "papaparse";
import Home from "../content/home/home";

const getCSVData = async () => {
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

  return parsedData.data;
};

const Page = async () => {
  const jobs = await getCSVData();

  return (
    <>
      <Home jobs={jobs.slice(0, 10)} />
    </>
  );
};

export default Page;

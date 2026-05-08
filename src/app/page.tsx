import fs from "fs";
import path from "path";
import Papa from "papaparse";
import Home from "../content/home/home";

const getCSVData = async () => {
  const filePath = path.join(process.cwd(), "data", "jobs.csv");

  const fileContent = fs.readFileSync(filePath, "utf8");

  const parsedData = Papa.parse(fileContent, {
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

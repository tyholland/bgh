import type { Metadata } from "next";
import Companies from "@/content/companies/companies";
import { getCompanies } from "@/requests/jobs";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Browse Companies | ${metaTitle}`,
  "Browse every company currently hiring on BGH Scout.",
  `${metaUrl}/companies`,
);

const Page = async () => {
  const companies = await getCompanies();

  return <Companies companies={companies} />;
};

export default Page;

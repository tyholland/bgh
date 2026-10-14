import type { Metadata } from "next";
import Company from "@/content/company/company";
import { getJobs } from "@/requests/jobs";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

interface PageProps {
  params: Promise<{ company: string }>;
  searchParams: Promise<{ page?: string }>;
}

// A company profile page is a subset of the same job dataset the home page's
// `?company=` filter already serves, not distinct content — same reasoning
// as the canonical rule in `src/app/(main)/page.tsx`, so this gets its own
// canonical rather than pointing back at "/".
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { company } = await params;
  const name = decodeURIComponent(company);

  return defaultMetaData(
    `${name} Jobs | ${metaTitle}`,
    `Open roles at ${name}, found via BGH Scout — aggregated from employer career pages and other public sources.`,
    `${metaUrl}/companies/${company}`,
  );
}

const Page = async ({ params, searchParams }: PageProps) => {
  const { company } = await params;
  const { page } = await searchParams;
  const name = decodeURIComponent(company);

  const data = await getJobs({ company: name, sort: "most", page });

  // Re-encode from the decoded name rather than reusing the raw `company`
  // param — Next.js may hand that param to us already URL-decoded, so this
  // guarantees companyPath is a valid path segment either way.
  return (
    <Company
      company={name}
      companyPath={encodeURIComponent(name)}
      data={data}
    />
  );
};

export default Page;

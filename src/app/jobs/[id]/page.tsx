import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Job from "@/content/job/job";
import { getJobById } from "@/requests/jobs";
import { sanitizeJobDescriptionServer } from "@/functions/sanitizeJobDescription.server";
import { buildJobPostingJsonLd } from "@/functions/jobPostingJsonLd";
import { defaultMetaData, metaUrl } from "@/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Shared between generateMetadata and the page body so a single request
// renders exactly one fetch, not two (per Next's "Memoizing data requests"
// guidance for generateMetadata).
const getJob = cache((id: string) => getJobById(id));

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    // Minimal fallback — the page itself calls notFound() and renders the
    // standard not-found page, this just avoids a broken <title> in the
    // moment before that.
    return defaultMetaData("Job Not Found");
  }

  const title = `${job["Role Name"]} at ${job.Company}`;
  const description =
    job.Details?.description
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) ||
    `${job["Role Name"]} at ${job.Company} — ${job["Primary Industry"]}. Found via BGH Scout.`;

  return defaultMetaData(title, description, `${metaUrl}/jobs/${id}`);
}

const JobPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) notFound();

  const descriptionHtml = sanitizeJobDescriptionServer(
    job.Details?.description,
  );

  const jsonLd = buildJobPostingJsonLd(
    job,
    `${metaUrl}/jobs/${id}`,
    descriptionHtml,
  );

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // JSON.stringify never emits "</script>" on its own for this
          // data, but the description field is third-party HTML we only
          // sanitize (not strip "<"), so escape defensively against a
          // closing-tag breakout before it's inlined into the page.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Job job={job} descriptionHtml={descriptionHtml} />
    </>
  );
};

export default JobPage;

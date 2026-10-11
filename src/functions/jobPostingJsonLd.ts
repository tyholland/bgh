import { CsvData } from "@/types";

// Builds a schema.org JobPosting object for the /jobs/[id] page's JSON-LD
// <script> tag — this is what makes a listing eligible for Google for Jobs.
//
// The irony: `Details` is already parsed from the employer's own JobPosting
// JSON-LD during ingestion (see BACKEND_REPO_PLAN.md "Crawl each job Link for
// JSON-LD JobPosting"), which is why its shape lines up with schema.org
// almost exactly. We're just re-emitting it as our own posting.
//
// Google requires title, description, datePosted, hiringOrganization.name,
// and (jobLocation or jobLocationType) for a JobPosting to be eligible.
// Emitting markup missing a required field gets flagged as invalid in
// Search Console, so this returns null — skip the <script> tag entirely —
// rather than emit something incomplete. That's expected to happen often:
// `Details` is only present when enrichment succeeded
// (`detailsStatus === "ok"`), and even then `jobLocation` can be unmapped.
export const buildJobPostingJsonLd = (
  job: CsvData,
  pageUrl: string,
  descriptionHtml: string,
): Record<string, unknown> | null => {
  const details = job.Details;
  const addressLocality = details?.jobLocation?.address?.addressLocality;

  if (!details || !descriptionHtml || !details.datePosted || !job.Company) {
    return null;
  }

  if (!addressLocality) {
    // No fallback to jobLocationType: "TELECOMMUTE" — we don't actually
    // know the role is remote just because we have no location, so skip
    // rather than guess.
    return null;
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job["Role Name"],
    description: descriptionHtml,
    datePosted: details.datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: job.Company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality,
      },
    },
    // We aggregate job postings but don't host the application itself —
    // applying always happens on the employer's own site.
    directApply: false,
    url: pageUrl,
  };

  if (details.validThrough) jsonLd.validThrough = details.validThrough;
  if (details.employmentType) jsonLd.employmentType = details.employmentType;
  if (details.jobBenefits) jsonLd.jobBenefits = details.jobBenefits;

  return jsonLd;
};

import { CsvData } from "@/types";

// The backend only ever hands us one flattened string for a job's location
// (e.g. "Boston, MA" or "123 Main St, Boston, MA, USA" or just "Remote") —
// see BACKEND_REPO_PLAN.md §4.2, which reads only `addressLocality` off the
// employer's own JobPosting markup and drops any sibling streetAddress /
// addressRegion / addressCountry fields it had. Reconstruct them here by
// position: the last three comma-separated parts are locality/region/country
// and anything left over in front is the street address.
const parseAddressLocality = (
  raw: string,
): {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
} => {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 3) {
    const [addressLocality, addressRegion, addressCountry] = parts;
    return { addressLocality, addressRegion, addressCountry };
  }

  const addressCountry = parts.pop();
  const addressRegion = parts.pop();
  const addressLocality = parts.pop();
  return { streetAddress: parts.join(", "), addressLocality, addressRegion, addressCountry };
};

// Best-effort "company website" for hiringOrganization.sameAs — we don't
// store one separately, but `Link` always points at the employer's own
// domain (careers page or ATS), so its origin is the closest thing we have.
const companyWebsite = (link: string): string | undefined => {
  try {
    return new URL(link).origin;
  } catch {
    return undefined;
  }
};

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

  const hiringOrganization: Record<string, unknown> = {
    "@type": "Organization",
    name: job.Company,
  };
  const sameAs = companyWebsite(job.Link);
  if (sameAs) hiringOrganization.sameAs = sameAs;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job["Role Name"],
    description: descriptionHtml,
    datePosted: details.datePosted,
    hiringOrganization,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...parseAddressLocality(addressLocality),
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

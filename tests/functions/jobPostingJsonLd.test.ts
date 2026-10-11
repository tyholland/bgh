import { describe, expect, it } from "vitest";
import { buildJobPostingJsonLd } from "@/functions/jobPostingJsonLd";
import { CsvData } from "@/types";

const pageUrl = "https://www.bghscout.com/jobs/abc123";
const descriptionHtml = "<p>Great role.</p>";

const baseJob: CsvData = {
  "Role Name": "Senior Product Manager",
  "Primary Industry": "Technology",
  Scrape_DateTime: "2026-09-10 14:32:00",
  Scrape_Date: "2026/09/10",
  Company: "Acme Corp",
  Link: "https://careers.acme.com/jobs/123",
  id: "abc123",
};

describe("buildJobPostingJsonLd", () => {
  it("returns a full JobPosting object when all required fields are present", () => {
    const job: CsvData = {
      ...baseJob,
      Details: {
        datePosted: "2026-09-08",
        description: "<p>irrelevant — descriptionHtml wins</p>",
        employmentType: "FULL_TIME",
        jobLocation: { address: { addressLocality: "Boston, MA" } },
        validThrough: "2026-10-08",
        jobBenefits: "Health, dental, 401k",
      },
    };

    const jsonLd = buildJobPostingJsonLd(job, pageUrl, descriptionHtml);

    expect(jsonLd).toEqual({
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: "Senior Product Manager",
      description: descriptionHtml,
      datePosted: "2026-09-08",
      hiringOrganization: { "@type": "Organization", name: "Acme Corp" },
      jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: "Boston, MA" },
      },
      directApply: false,
      url: pageUrl,
      validThrough: "2026-10-08",
      employmentType: "FULL_TIME",
      jobBenefits: "Health, dental, 401k",
    });
  });

  it("omits optional fields that are absent instead of emitting them as undefined", () => {
    const job: CsvData = {
      ...baseJob,
      Details: {
        datePosted: "2026-09-08",
        description: "<p>irrelevant</p>",
        employmentType: "",
        jobLocation: { address: { addressLocality: "Boston, MA" } },
      },
    };

    const jsonLd = buildJobPostingJsonLd(job, pageUrl, descriptionHtml);

    expect(jsonLd).not.toBeNull();
    expect(jsonLd).not.toHaveProperty("validThrough");
    expect(jsonLd).not.toHaveProperty("employmentType");
    expect(jsonLd).not.toHaveProperty("jobBenefits");
  });

  it("returns null when enrichment never happened (no Details)", () => {
    expect(buildJobPostingJsonLd(baseJob, pageUrl, descriptionHtml)).toBeNull();
  });

  it("returns null when the description is empty", () => {
    const job: CsvData = {
      ...baseJob,
      Details: {
        datePosted: "2026-09-08",
        description: "<p>x</p>",
        employmentType: "FULL_TIME",
        jobLocation: { address: { addressLocality: "Boston, MA" } },
      },
    };

    expect(buildJobPostingJsonLd(job, pageUrl, "")).toBeNull();
  });

  it("returns null when there is no location, rather than guessing remote", () => {
    const job: CsvData = {
      ...baseJob,
      Details: {
        datePosted: "2026-09-08",
        description: "<p>x</p>",
        employmentType: "FULL_TIME",
        jobLocation: { address: { addressLocality: "" } },
      },
    };

    expect(buildJobPostingJsonLd(job, pageUrl, descriptionHtml)).toBeNull();
  });

  it("returns null when datePosted is missing", () => {
    const job: CsvData = {
      ...baseJob,
      Details: {
        datePosted: "",
        description: "<p>x</p>",
        employmentType: "FULL_TIME",
        jobLocation: { address: { addressLocality: "Boston, MA" } },
      },
    };

    expect(buildJobPostingJsonLd(job, pageUrl, descriptionHtml)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { jobHref } from "@/functions/jobHref";
import { CsvData } from "@/types";

const baseJob: CsvData = {
  "Role Name": "Senior Product Manager",
  "Primary Industry": "Technology",
  Scrape_DateTime: "2026-09-10 14:32:00",
  Scrape_Date: "2026/09/10",
  Company: "Acme Corp",
  Link: "https://careers.acme.com/jobs/123",
};

describe("jobHref", () => {
  it("returns a /jobs/[id] path when the job has an id", () => {
    expect(jobHref({ ...baseJob, id: "abc123" })).toBe("/jobs/abc123");
  });

  it("returns undefined when the job has no id yet", () => {
    expect(jobHref(baseJob)).toBeUndefined();
  });
});

import { test, expect } from "@playwright/test";
import {
  ENRICHED_JOB_ID,
  ENRICHED_JOB_ROLE,
  ENRICHED_JOB_COMPANY,
  ENRICHED_JOB_LINK,
  JOB_WITHOUT_DETAILS_ID,
  JOB_WITHOUT_DETAILS_ROLE,
} from "./fixtures/test-data";

// Covers the /jobs/[id] detail page added for SEO: a real, public,
// crawlable URL per job with JobPosting JSON-LD — see
// BACKEND_REPO_PLAN.md §5 for the `id` field / `GET /v1/jobs/:id` contract
// this relies on (mocked here by mock-api-server.mjs).
test.describe("job detail page", () => {
  test("job cards link to the public /jobs/[id] page", async ({ page }) => {
    await page.goto("/");

    // Crawlers (and ctrl/cmd-click) need a real href, not just an onClick —
    // see card.tsx.
    await expect(
      page.locator(`a[href="/jobs/${ENRICHED_JOB_ID}"]`),
    ).toBeVisible();
  });

  test("a plain click navigates straight to the job's public page", async ({
    page,
  }) => {
    await page.goto("/");

    // card.tsx renders the card as a real Link once the job has an id, and a
    // plain click now follows it directly — no sign-in gate, no
    // quick-preview modal. A longer timeout covers Turbopack compiling that
    // route on its first hit.
    await page.getByText(ENRICHED_JOB_ROLE, { exact: true }).click();

    await page.waitForURL(`/jobs/${ENRICHED_JOB_ID}`, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: ENRICHED_JOB_ROLE }),
    ).toBeVisible();
  });

  test("renders the public job page without requiring sign-in", async ({
    page,
  }) => {
    await page.goto(`/jobs/${ENRICHED_JOB_ID}`);

    await expect(
      page.getByRole("heading", { name: ENRICHED_JOB_ROLE }),
    ).toBeVisible();
    // Several elements legitimately contain the company name (the heading
    // area, the apply link, the <title>) — just confirm it shows up at all.
    await expect(page.getByText(ENRICHED_JOB_COMPANY).first()).toBeVisible();
    await expect(
      page.getByText("Build and maintain our core API services."),
    ).toBeVisible();

    // Location sits behind the "Additional Details" toggle (job.tsx).
    await page.getByRole("button", { name: "Additional Details" }).click();
    await expect(page.getByText("Remote")).toBeVisible();

    const applyLink = page.getByRole("link", { name: /Apply on/ });
    await expect(applyLink).toHaveAttribute("href", ENRICHED_JOB_LINK);
    await expect(applyLink).toHaveAttribute("rel", /nofollow/);
    await expect(applyLink).toHaveAttribute("target", "_blank");
  });

  test("emits JobPosting JSON-LD for an enriched job", async ({ page }) => {
    await page.goto(`/jobs/${ENRICHED_JOB_ID}`);

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .innerText();
    const data = JSON.parse(jsonLd);

    expect(data["@type"]).toBe("JobPosting");
    expect(data.title).toBe(ENRICHED_JOB_ROLE);
    expect(data.hiringOrganization.name).toBe(ENRICHED_JOB_COMPANY);
    expect(data.jobLocation.address.addressLocality).toBe("Remote");
    expect(data.datePosted).toBe("2026-09-18");
    expect(data.validThrough).toBe("2026-12-01");
  });

  test("skips JSON-LD for a job with no scraped details, but still renders the page", async ({
    page,
  }) => {
    await page.goto(`/jobs/${JOB_WITHOUT_DETAILS_ID}`);

    await expect(
      page.getByRole("heading", { name: JOB_WITHOUT_DETAILS_ROLE }),
    ).toBeVisible();
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(0);
  });

  test("404s for an unknown job id", async ({ page }) => {
    const response = await page.goto("/jobs/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });
});

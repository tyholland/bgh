import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  JOB_WITH_XSS_ROLE,
  JOB_WITH_XSS_COMPANY,
  JOB_WITHOUT_DETAILS_ROLE,
} from "./fixtures/test-data";

test.describe("job details", () => {
  test("shows job details with the scraped description sanitized", async ({
    page,
  }) => {
    await signInAsTestUser(page);

    await page.getByText(JOB_WITH_XSS_ROLE, { exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Job Details" }),
    ).toBeVisible();
    await expect(
      page.getByText(`Company: ${JOB_WITH_XSS_COMPANY}`),
    ).toBeVisible();
    await expect(page.getByText("Austin, TX")).toBeVisible();
    await expect(page.getByText("Design large-scale systems.")).toBeVisible();

    // The fixture description carries a <script> tag and an onerror handler —
    // DOMPurify (cardDetails-modal.tsx) must strip both before they reach the
    // DOM, so neither should ever run.
    const xssFlag = await page.evaluate(
      () => (window as unknown as { __xss?: boolean }).__xss,
    );
    expect(xssFlag).toBeUndefined();
    await expect(page.locator("script", { hasText: "__xss" })).toHaveCount(0);
  });

  test("gracefully shows a job with no scraped details", async ({ page }) => {
    await signInAsTestUser(page);

    await page.getByText(JOB_WITHOUT_DETAILS_ROLE, { exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Job Details" }),
    ).toBeVisible();
    await expect(
      page.getByText(`Role: ${JOB_WITHOUT_DETAILS_ROLE}`),
    ).toBeVisible();
    await expect(page.getByText("Job Description:")).not.toBeVisible();
  });

  test("opens the original posting in a new tab from the details modal", async ({
    page,
  }) => {
    await signInAsTestUser(page);

    // The fixture Link points at a domain that doesn't resolve — without a
    // response, Chromium replaces the popup's URL with an internal error
    // page before we can read it back. Fulfilling the request keeps the
    // real target URL in place, which is all this test cares about.
    await page.context().route(
      "https://jobs.acmecorp.example/**",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>ok</body></html>",
        }),
    );

    await page.getByText(JOB_WITHOUT_DETAILS_ROLE, { exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Job Details" }),
    ).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "See Role" }).click(),
    ]);
    await popup.waitForLoadState();

    expect(popup.url()).toBe(
      "https://jobs.acmecorp.example/account-executive",
    );
  });
});

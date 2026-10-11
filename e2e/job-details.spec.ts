import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  JOB_WITH_XSS_ROLE,
  JOB_WITH_XSS_COMPANY,
  JOB_WITH_XSS_ID,
  JOB_WITHOUT_DETAILS_ROLE,
  JOB_WITHOUT_DETAILS_ID,
} from "./fixtures/test-data";

// Cards now link straight through to the public /jobs/[id] page (card.tsx) —
// there's no quick-preview modal to open anymore, so these exercise the same
// behaviors (sanitization, collapsed details, opening the original posting)
// directly against that page instead. No sign-in required, same as the page
// itself.
test.describe("job details", () => {
  test("shows job details with the scraped description sanitized", async ({
    page,
  }) => {
    await page.goto(`/jobs/${JOB_WITH_XSS_ID}`);

    await expect(
      page.getByRole("heading", { name: JOB_WITH_XSS_ROLE }),
    ).toBeVisible();
    await expect(page.getByText(JOB_WITH_XSS_COMPANY).first()).toBeVisible();
    await expect(page.getByText("Design large-scale systems.")).toBeVisible();

    // Location lives under "Additional Details", collapsed by default.
    await expect(page.getByText("Austin, TX")).not.toBeVisible();
    await page.getByRole("button", { name: "Additional Details" }).click();
    await expect(page.getByText("Austin, TX")).toBeVisible();

    // The fixture description carries a <script> tag and an onerror handler —
    // DOMPurify (sanitizeJobDescription.server.ts) must strip both before
    // they reach the DOM, so neither should ever run.
    const xssFlag = await page.evaluate(
      () => (window as unknown as { __xss?: boolean }).__xss,
    );
    expect(xssFlag).toBeUndefined();
    await expect(page.locator("script", { hasText: "__xss" })).toHaveCount(0);
  });

  test("gracefully shows a job with no scraped details", async ({ page }) => {
    await page.goto(`/jobs/${JOB_WITHOUT_DETAILS_ID}`);

    await expect(
      page.getByRole("heading", { name: JOB_WITHOUT_DETAILS_ROLE }),
    ).toBeVisible();
    await expect(page.getByText("Job Description:")).not.toBeVisible();
  });

  test("opens the original posting in a new tab", async ({ page }) => {
    // Applying still requires sign-in (job.tsx's own requireUser gate on the
    // apply link) — unaffected by card.tsx, which only governs the card
    // click into this page.
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

    await page.goto(`/jobs/${JOB_WITHOUT_DETAILS_ID}`);

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: /Apply on/ }).click(),
    ]);
    await popup.waitForLoadState();

    expect(popup.url()).toBe(
      "https://jobs.acmecorp.example/account-executive",
    );
  });
});

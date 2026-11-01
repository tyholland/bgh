import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  UNIQUE_SEARCH_TERM,
  UNIQUE_SEARCH_PARAM,
  UNIQUE_SEARCH_BUBBLE_TERMS,
  SEARCH_PLACEHOLDER,
  FILTER_COMPANY,
  FILTER_COMPANY_JOB_COUNT,
  TOTAL_JOBS,
  ALPHABETICALLY_FIRST_ROLE,
  ALPHABETICALLY_LAST_ROLE,
} from "./fixtures/test-data";

test.describe("search", () => {
  test("searches for jobs by keyword", async ({ page }) => {
    await signInAsTestUser(page);

    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();

    await expect(page).toHaveURL(/search=/);
    expect(new URL(page.url()).searchParams.get("search")).toBe(
      UNIQUE_SEARCH_PARAM,
    );
    await expect(page.getByText("1 jobs found")).toBeVisible();
    await expect(
      page.getByText(UNIQUE_SEARCH_TERM, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }),
    ).not.toBeVisible();
  });

  test("clears an active search", async ({ page }) => {
    await signInAsTestUser(page);

    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();
    await expect(page.getByText("1 jobs found")).toBeVisible();

    // The parser splits the phrase into one bubble per title term — remove
    // them one at a time, waiting for each to detach before the next click
    // so it doesn't race the previous removal's navigation.
    for (const term of UNIQUE_SEARCH_BUBBLE_TERMS) {
      const bubble = page.getByRole("button", { name: `${term} x` });
      await bubble.click();
      await expect(bubble).toBeHidden();
    }

    await expect(page).not.toHaveURL(/search=/);
    await expect(
      page.getByText(new RegExp(`${TOTAL_JOBS}\\s*jobs found`)),
    ).toBeVisible();
  });
});

test.describe("filter", () => {
  test("filters jobs by company", async ({ page }) => {
    await signInAsTestUser(page);

    await page.getByRole("button", { name: "Filter Jobs" }).click();
    await expect(
      page.getByRole("heading", { name: "Filter Jobs" }),
    ).toBeVisible();

    await page
      .locator(`input[name="companyCheckbox"][value="${FILTER_COMPANY}"]`)
      .check();
    // filter.tsx now renders an Apply button per section — Keyword Search
    // (always present, disabled until typed into), then Company, then
    // Industry — so Company's is the second, not the first.
    await page.getByRole("button", { name: "Apply" }).nth(1).click();
    await page.getByRole("button", { name: "Close", exact: true }).click();

    await expect(page).toHaveURL(/company=Acme\+Corp/);
    await expect(
      page.getByText(`${FILTER_COMPANY_JOB_COUNT} jobs found`),
    ).toBeVisible();
    await expect(
      page.getByText(ALPHABETICALLY_LAST_ROLE, { exact: true }),
    ).not.toBeVisible();
  });
});

test.describe("sort", () => {
  test("sorts jobs alphabetically", async ({ page }) => {
    await signInAsTestUser(page);

    await page.locator('select[name="sortSelect"]').selectOption("a");
    await expect(page).toHaveURL(/sort=a/);
    await expect(
      page.locator("div.position").first(),
    ).toHaveText(ALPHABETICALLY_FIRST_ROLE);

    await page.locator('select[name="sortSelect"]').selectOption("z");
    await expect(page).toHaveURL(/sort=z/);
    await expect(
      page.locator("div.position").first(),
    ).toHaveText(ALPHABETICALLY_LAST_ROLE);
  });
});

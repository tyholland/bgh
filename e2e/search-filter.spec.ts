import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  UNIQUE_SEARCH_TERM,
  FILTER_COMPANY,
  FILTER_COMPANY_JOB_COUNT,
  TOTAL_JOBS,
  ALPHABETICALLY_FIRST_ROLE,
  ALPHABETICALLY_LAST_ROLE,
} from "./fixtures/test-data";

test.describe("search", () => {
  test("searches for jobs by keyword", async ({ page }) => {
    await signInAsTestUser(page);

    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();

    await expect(page).toHaveURL(/search=Growth\+Marketer/);
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

    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();
    await expect(page.getByText("1 jobs found")).toBeVisible();

    await page
      .getByRole("button", { name: `${UNIQUE_SEARCH_TERM} x` })
      .click();

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
    await page.getByRole("button", { name: "Apply" }).first().click();
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

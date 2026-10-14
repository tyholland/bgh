import { test, expect } from "@playwright/test";
import {
  TOTAL_JOBS,
  UNIQUE_SEARCH_TERM,
  ALPHABETICALLY_FIRST_ROLE,
  ALPHABETICALLY_LAST_ROLE,
} from "./fixtures/test-data";

test.describe("home page — anonymous visitor", () => {
  test("shows job listings pulled from the API and a total count", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByText("Find Opportunities You Might Be Missing"),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${TOTAL_JOBS}\\s*jobs found`)),
    ).toBeVisible();
    await expect(
      page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }),
    ).toBeVisible();
  });

  test("searches for jobs without requiring sign-in", async ({ page }) => {
    await page.goto("/");

    // search.tsx's handleSearch dropped its requireUser() gate — anyone can
    // search; signing in is only required to save a search
    // (handleSaveSearchClick) — handleRemoveSearch dropped the gate too.
    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).not.toBeVisible();
    await expect(page).toHaveURL(/search=Growth\+Marketer/);
    await expect(page.getByText("1 jobs found")).toBeVisible();
    await expect(
      page.getByText(UNIQUE_SEARCH_TERM, { exact: true }),
    ).toBeVisible();
  });

  test("still prompts sign in to save a search", async ({ page }) => {
    await page.goto("/");

    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();
    await expect(page.getByText("1 jobs found")).toBeVisible();

    await page.getByRole("button", { name: "Save Search" }).click();
    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).toBeVisible();
  });

  test("removes a search term without requiring sign-in", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill(UNIQUE_SEARCH_TERM);
    await page.getByRole("button", { name: "Search Jobs" }).click();
    await expect(page.getByText("1 jobs found")).toBeVisible();

    await page
      .getByRole("button", { name: `${UNIQUE_SEARCH_TERM} x` })
      .click();

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).not.toBeVisible();
    await expect(page).not.toHaveURL(/search=/);
    await expect(
      page.getByText(new RegExp(`${TOTAL_JOBS}\\s*jobs found`)),
    ).toBeVisible();
  });

  test("opens a job card without requiring sign-in", async ({ page }) => {
    await page.goto("/");

    // Cards link straight through to the public /jobs/[id] page now
    // (card.tsx) — no sign-in gate on the card click itself. A longer
    // timeout covers Turbopack compiling that route on its first hit.
    await page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }).click();

    await page.waitForURL(/\/jobs\//, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: ALPHABETICALLY_FIRST_ROLE }),
    ).toBeVisible();
  });

  test("prompts sign in when changing the sort order", async ({ page }) => {
    await page.goto("/");

    await page.locator('select[name="sortSelect"]').selectOption("a");

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).toBeVisible();
  });

  test("switches between grid and list view without signing in", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("Role", { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "List View Icon" }).click();
    await expect(page.getByText("Role", { exact: true })).toBeVisible();
    await expect(page.getByText("Company", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Grid View Icon" }).click();
    await expect(page.getByText("Role", { exact: true })).not.toBeVisible();
  });

  test("paginates to the second page of results", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText(ALPHABETICALLY_LAST_ROLE, { exact: true }),
    ).not.toBeVisible();

    await page
      .getByRole("button", { name: "Page 2", exact: true })
      .first()
      .click();

    await expect(page).toHaveURL(/page=2/);
    await expect(
      page.getByText(ALPHABETICALLY_LAST_ROLE, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }),
    ).not.toBeVisible();
  });
});

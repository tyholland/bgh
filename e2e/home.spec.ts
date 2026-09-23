import { test, expect } from "@playwright/test";
import {
  TOTAL_JOBS,
  ALPHABETICALLY_FIRST_ROLE,
  ALPHABETICALLY_LAST_ROLE,
} from "./fixtures/test-data";

test.describe("home page — anonymous visitor", () => {
  test("shows job listings pulled from the API and a total count", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByText("Find your next opportunity"),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`${TOTAL_JOBS}\\s*jobs found`)),
    ).toBeVisible();
    await expect(
      page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }),
    ).toBeVisible();
  });

  test("prompts sign in when searching without an account", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByPlaceholder("Search jobs, keywords, skills...")
      .fill("Engineer");
    await page.getByRole("button", { name: "Search Jobs" }).click();

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).toBeVisible();
    // Gating happens before navigation — the URL must be untouched.
    await expect(page).toHaveURL("/");
  });

  test("prompts sign in when opening a job card", async ({ page }) => {
    await page.goto("/");

    await page.getByText(ALPHABETICALLY_FIRST_ROLE, { exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
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

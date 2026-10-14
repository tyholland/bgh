import { test, expect } from "@playwright/test";
import { signInAsTestUser } from "./fixtures/test-data";

const AI_SEARCH_PLACEHOLDER =
  'e.g. "Remote senior UI developer roles using React, posted in the last week"';

test.describe("ai search", () => {
  // Exercises the real rule-based parser end to end (POST /api/ai-search
  // isn't mocked here) — "Globex Corporation" / "Software Engineering" are
  // real facet values in e2e/fixtures/jobs-data.mjs, so this also proves the
  // route only lets through a company/industry that actually exists.
  test("extracts filters from a free-text query with the real rule-based parser", async ({
    page,
  }) => {
    await signInAsTestUser(page);

    await page
      .getByPlaceholder(AI_SEARCH_PLACEHOLDER)
      .fill(
        "Remote senior React developer at Globex Corporation in Software Engineering, pay at least $100k, posted in the last week",
      );
    await page.getByRole("button", { name: "Find Jobs" }).click();

    await expect(page).toHaveURL(/company=/);

    const url = new URL(page.url());
    expect(url.searchParams.get("company")).toBe("Globex Corporation");
    expect(url.searchParams.get("industry")).toBe("Software Engineering");
    expect(url.searchParams.get("keyword")?.split(",")).toEqual(
      expect.arrayContaining(["Remote", "React"]),
    );
    expect(url.searchParams.get("search")?.split(",")).toEqual(
      expect.arrayContaining(["Senior", "developer"]),
    );
    expect(url.searchParams.get("date")).toBeTruthy();

    await expect(
      page.getByText("Pay isn't filtered — job listings don't include salary data."),
    ).toBeVisible();
  });

  test("falls back to a plain title search for wording outside its dictionaries", async ({
    page,
  }) => {
    await signInAsTestUser(page);

    await page.getByPlaceholder(AI_SEARCH_PLACEHOLDER).fill("Growth Marketer");
    await page.getByRole("button", { name: "Find Jobs" }).click();

    await expect(page).toHaveURL(/search=/);
    const url = new URL(page.url());
    expect(url.searchParams.get("search")?.split(",")).toEqual(
      expect.arrayContaining(["Growth", "Marketer"]),
    );
    await expect(page.getByText("1 jobs found")).toBeVisible();
  });

  test("shows an error when the request fails", async ({ page }) => {
    await signInAsTestUser(page);

    await page.route("**/api/ai-search", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "AI search is temporarily unavailable. Try again shortly." }),
      });
    });

    await page
      .getByPlaceholder(AI_SEARCH_PLACEHOLDER)
      .fill("Remote senior developer roles");
    await page.getByRole("button", { name: "Find Jobs" }).click();

    await expect(
      page.getByText("AI search is temporarily unavailable. Try again shortly."),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/search=/);
  });

  test("requires sign-in before applying a search", async ({ page }) => {
    await page.goto("/");

    await page
      .getByPlaceholder(AI_SEARCH_PLACEHOLDER)
      .fill("Remote senior developer roles");
    await page.getByRole("button", { name: "Find Jobs" }).click();

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});

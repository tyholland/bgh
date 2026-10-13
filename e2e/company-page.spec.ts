import { test, expect } from "@playwright/test";
import { FILTER_COMPANY, FILTER_COMPANY_JOB_COUNT } from "./fixtures/test-data";

// Covers /companies (browse) and /companies/[company] (profile) — both read
// from the same /v1/jobs endpoint the home page already uses (the companies
// facet, and a company-filtered page respectively), mocked by
// mock-api-server.mjs / jobs-data.mjs.
test.describe("company pages", () => {
  test("lists every company with an open-role count, filterable by name", async ({
    page,
  }) => {
    await page.goto("/companies");

    await expect(
      page.getByRole("link", { name: new RegExp(FILTER_COMPANY) }),
    ).toBeVisible();
    await expect(page.getByText("Globex Corporation")).toBeVisible();

    await page.getByPlaceholder("Search companies...").fill("Acme");
    await expect(page.getByText("Globex Corporation")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: new RegExp(FILTER_COMPANY) }),
    ).toBeVisible();
  });

  test("a company's profile page lists only its own open roles", async ({
    page,
  }) => {
    await page.goto("/companies");
    await page.getByRole("link", { name: new RegExp(FILTER_COMPANY) }).click();

    await expect(page).toHaveURL(`/companies/${encodeURIComponent(FILTER_COMPANY)}`);
    await expect(page.getByRole("heading", { name: FILTER_COMPANY })).toBeVisible();
    await expect(
      page.getByText(`${FILTER_COMPANY_JOB_COUNT} open roles`),
    ).toBeVisible();

    // Every visible card belongs to this company, not just the first.
    const cardCompanies = page.locator(".topLayer .company");
    await expect(cardCompanies).toHaveCount(FILTER_COMPANY_JOB_COUNT);
    for (const name of await cardCompanies.allTextContents()) {
      expect(name).toBe(FILTER_COMPANY);
    }

    await page
      .getByRole("link", { name: new RegExp(`Search & filter ${FILTER_COMPANY}`) })
      .click();
    await expect(page).toHaveURL(new RegExp(`company=${encodeURIComponent(FILTER_COMPANY)}`));
  });

  test("404s are avoided for an unknown company — shows an empty state instead", async ({
    page,
  }) => {
    await page.goto("/companies/Nonexistent%20Inc");

    await expect(
      page.getByRole("heading", { name: "Nonexistent Inc" }),
    ).toBeVisible();
    await expect(page.getByText("0 open roles")).toBeVisible();
    await expect(
      page.getByText("Nonexistent Inc has no open roles right now."),
    ).toBeVisible();
  });
});

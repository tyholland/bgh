import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  TEST_USER,
  UNIQUE_SEARCH_TERM,
} from "./fixtures/test-data";

interface SavedSearchRecord {
  id: string;
  uid: string;
  name: string | null;
  params: Record<string, string>;
  createdAt: string;
}

test("saves a search, applies it from the account page, then deletes it", async ({
  page,
}) => {
  await signInAsTestUser(page);

  const savedSearches: SavedSearchRecord[] = [];
  let nextId = 1;

  // POST/GET share the collection URL, DELETE targets /v1/saved-searches/:id
  // — two routes because Playwright's `*` glob doesn't cross a `/`.
  await page.route("**/v1/saved-searches", async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      const body = request.postDataJSON() as {
        name?: string;
        params: Record<string, string>;
      };
      const record: SavedSearchRecord = {
        id: `saved-${nextId++}`,
        uid: TEST_USER.uid,
        name: body.name ?? null,
        params: body.params,
        createdAt: new Date().toISOString(),
      };
      savedSearches.push(record);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(record),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ savedSearches }),
    });
  });

  await page.route("**/v1/saved-searches/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    const index = savedSearches.findIndex((entry) => entry.id === id);
    if (index !== -1) savedSearches.splice(index, 1);

    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page
    .getByPlaceholder("Search jobs, keywords, skills...")
    .fill(UNIQUE_SEARCH_TERM);
  await page.getByRole("button", { name: "Search Jobs" }).click();
  await expect(page.getByText("1 jobs found")).toBeVisible();

  await page.getByRole("button", { name: "Save Search" }).click();
  await expect(
    page.getByRole("heading", { name: "Save Search" }),
  ).toBeVisible();

  await page
    .getByPlaceholder("Name this search (optional)")
    .fill("My growth marketer search");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Your search has been saved.")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();

  await page.getByRole("link", { name: /Welcome Jordan/ }).click();
  await expect(page).toHaveURL("/account");
  await expect(page.getByText("My growth marketer search")).toBeVisible();
  await expect(page.getByText(`Search: ${UNIQUE_SEARCH_TERM}`)).toBeVisible();

  await page.getByRole("link", { name: "View Results" }).click();
  await expect(page).toHaveURL(/search=Growth\+Marketer/);
  await expect(page.getByText("1 jobs found")).toBeVisible();

  await page.getByRole("link", { name: /Welcome Jordan/ }).click();
  await expect(page).toHaveURL("/account");
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(
    page.getByText("You haven't saved any searches yet."),
  ).toBeVisible();
});

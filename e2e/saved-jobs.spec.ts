import { test, expect } from "@playwright/test";
import {
  signInAsTestUser,
  TEST_USER,
  ENRICHED_JOB_ID,
  ENRICHED_JOB_ROLE,
} from "./fixtures/test-data";

interface SavedJobRecord {
  id: string;
  uid: string;
  jobId: string;
  roleName: string;
  company: string | null;
  link: string;
  createdAt: string;
}

test("saves a job from its detail page, manages it from the account page", async ({
  page,
}) => {
  await signInAsTestUser(page);

  const savedJobs: SavedJobRecord[] = [];
  let nextId = 1;

  // POST/GET share the collection URL, DELETE targets /v1/saved-jobs/:id —
  // two routes because Playwright's `*` glob doesn't cross a `/`.
  await page.route("**/v1/saved-jobs", async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      const body = request.postDataJSON() as {
        jobId: string;
        roleName: string;
        company: string | null;
        link: string;
      };
      const record: SavedJobRecord = {
        id: `saved-${nextId++}`,
        uid: TEST_USER.uid,
        jobId: body.jobId,
        roleName: body.roleName,
        company: body.company,
        link: body.link,
        createdAt: new Date().toISOString(),
      };
      savedJobs.push(record);
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(record),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ savedJobs }),
    });
  });

  await page.route("**/v1/saved-jobs/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    const index = savedJobs.findIndex((entry) => entry.id === id);
    if (index !== -1) savedJobs.splice(index, 1);

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });

  await page.goto(`/jobs/${ENRICHED_JOB_ID}`);

  await page.getByRole("button", { name: /Save Job/ }).click();
  await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible();

  await page.getByRole("link", { name: /Welcome Jordan/ }).click();
  await expect(page).toHaveURL("/account");
  await expect(page.getByText(ENRICHED_JOB_ROLE, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByText("You haven't saved any jobs yet."),
  ).toBeVisible();
});

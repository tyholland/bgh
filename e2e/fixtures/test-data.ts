import type { Page } from "@playwright/test";
import { mockFirebaseAuth, type FakeUser } from "./firebase-auth";

// These literals describe e2e/fixtures/jobs-data.mjs — the mock API's fixture
// dataset. Kept as plain constants (rather than importing the .mjs file)
// because that file is loaded directly by Node for the mock server, outside
// TypeScript/Playwright's module resolution.
export const TOTAL_JOBS = 20;
export const JOBS_PER_PAGE = 18;
export const JOBS_ON_LAST_PAGE = TOTAL_JOBS - JOBS_PER_PAGE;

export const UNIQUE_SEARCH_TERM = "Growth Marketer";
export const FILTER_COMPANY = "Acme Corp";
export const FILTER_COMPANY_JOB_COUNT = 5;

export const ALPHABETICALLY_FIRST_ROLE = "Account Executive";
export const ALPHABETICALLY_LAST_ROLE = "Zonal Sales Manager";

export const JOB_WITHOUT_DETAILS_ROLE = "Account Executive";
export const JOB_WITH_XSS_ROLE = "Solutions Architect";
export const JOB_WITH_XSS_COMPANY = "Acme Corp";

export const TEST_USER: FakeUser = {
  uid: "uid-existing-1",
  email: "jordan.taylor@example.com",
  password: "correct-horse-battery",
  displayName: "Jordan Taylor",
};

/** Mocks Firebase Auth seeded with TEST_USER, then signs in through the UI. */
export const signInAsTestUser = async (page: Page) => {
  await mockFirebaseAuth(page, { users: [TEST_USER] });

  await page.goto("/sign-in");
  await page.getByPlaceholder("Enter your email").fill(TEST_USER.email);
  await page.getByPlaceholder("Enter your password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL("/");
};

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
export const JOB_WITHOUT_DETAILS_ID = "account-executive";
export const JOB_WITH_XSS_ROLE = "Solutions Architect";
export const JOB_WITH_XSS_COMPANY = "Acme Corp";
export const JOB_WITH_XSS_ID = "solutions-architect";

// Backend Engineer @ Globex — the one fixture job with a full Details block
// (location, validThrough, employmentType, benefits), so it's the one
// that's eligible for JobPosting JSON-LD on its /jobs/[id] page.
export const ENRICHED_JOB_ROLE = "Backend Engineer";
export const ENRICHED_JOB_COMPANY = "Globex Corporation";
export const ENRICHED_JOB_ID = "backend-engineer";
export const ENRICHED_JOB_LINK = "https://jobs.globex.example/backend-engineer";

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

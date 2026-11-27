import { test, expect, type Page } from "@playwright/test";
import { mockFirebaseAuth, type FakeUser } from "./fixtures/firebase-auth";

// e2e/fixtures/mock-api-server.mjs's GET /v1/users/:uid stands in for the
// real API: any uid containing "no-sub" comes back with subscriptionStatus
// "none", everyone else (e.g. TEST_USER, used throughout the rest of the
// suite) comes back "active" — so this is the one fixture user that
// exercises the "signed in but never started a trial" gated state.
const NO_SUB_USER: FakeUser = {
  uid: "uid-no-sub-1",
  email: "casey.morgan@example.com",
  password: "correct-horse-battery",
  displayName: "Casey Morgan",
};

// Same convenience as e2e/auth-redirect.spec.ts's triggerSignInModal — the
// sort select is a requireAccess()-gated action that never mutates the URL
// for someone without access, so it's a reliable way to pop the gate open.
const triggerGateModal = async (page: Page) => {
  await page.goto("/");
  await page.locator('select[name="sortSelect"]').selectOption("a");
};

test.describe("subscription gate", () => {
  test("a signed-out visitor is invited to sign up for a free trial", async ({
    page,
  }) => {
    await mockFirebaseAuth(page);

    await triggerGateModal(page);

    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).toBeVisible();
    await expect(
      page.getByText(/free 7-day trial/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeVisible();
  });

  test("a signed-in visitor with no active trial/subscription is still blocked, with different messaging", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [NO_SUB_USER] });

    await page.goto("/sign-in");
    await page.getByPlaceholder("Enter your email").fill(NO_SUB_USER.email);
    await page
      .getByPlaceholder("Enter your password")
      .fill(NO_SUB_USER.password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.waitForURL("/");

    await page.locator('select[name="sortSelect"]').selectOption("a");

    await expect(
      page.getByRole("heading", { name: "Start Your Free Trial" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Please Sign In" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign Up" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Free Trial" }),
    ).toBeVisible();

    // The sort select itself never changed — same "still blocked" behavior
    // as a signed-out visitor, just different modal copy.
    await expect(page).toHaveURL("/");
  });
});

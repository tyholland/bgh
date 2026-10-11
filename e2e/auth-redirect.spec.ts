import { test, expect, type Page } from "@playwright/test";
import { mockFirebaseAuth } from "./fixtures/firebase-auth";
import { TEST_USER } from "./fixtures/test-data";

// The sort select is a convenient requireUser()-gated action: picking it
// never mutates the URL for a signed-out visitor (home.tsx checks `user`
// before touching searchParams), so /?page=2 is still the page the gated
// modal captures as the redirect target.
const triggerSignInModal = async (page: Page) => {
  await page.goto("/?page=2");
  await page.locator('select[name="sortSelect"]').selectOption("a");
  await expect(
    page.getByRole("heading", { name: "Please Sign In" }),
  ).toBeVisible();
};

test.describe("post-auth redirect", () => {
  test("returns to the original page after signing in from the gated modal", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await triggerSignInModal(page);

    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.waitForURL(/\/sign-in\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(
      "/?page=2",
    );

    await page.getByPlaceholder("Enter your email").fill(TEST_USER.email);
    await page
      .getByPlaceholder("Enter your password")
      .fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page).toHaveURL("/?page=2");
  });

  test("returns to the original page after creating an account from the gated modal", async ({
    page,
  }) => {
    await mockFirebaseAuth(page);

    await triggerSignInModal(page);

    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await page.waitForURL(/\/sign-up\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(
      "/?page=2",
    );

    await page.getByPlaceholder("Enter your first name").fill("Alex");
    await page.getByPlaceholder("Enter your last name").fill("Rivera");
    await page
      .getByPlaceholder("Enter your email")
      .fill("alex.rivera@example.com");
    await page
      .getByPlaceholder("Enter your password")
      .fill("a-brand-new-password");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/?page=2");
  });

  test("keeps the redirect target when switching between sign in and sign up", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await triggerSignInModal(page);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.waitForURL(/\/sign-in\?redirect=/);

    // Scoped to each page's own "Don't/Already have an account" paragraph —
    // the nav bar's unrelated "Sign In" link (no redirect param) carries the
    // exact same accessible name, so an unscoped getByRole locator could
    // match either one.
    await page
      .getByText("Don't have an account.")
      .getByRole("link", { name: "Sign Up" })
      .click();
    await page.waitForURL(/\/sign-up\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(
      "/?page=2",
    );

    await page
      .getByText("Already have an account.")
      .getByRole("link", { name: "Sign In" })
      .click();
    await page.waitForURL(/\/sign-in\?redirect=/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(
      "/?page=2",
    );
  });

  test("ignores an unsafe redirect target and falls back to the home page", async ({
    page,
  }) => {
    await mockFirebaseAuth(page, { users: [TEST_USER] });

    await page.goto("/sign-in?redirect=https%3A%2F%2Fevil.example.com");
    await page.getByPlaceholder("Enter your email").fill(TEST_USER.email);
    await page
      .getByPlaceholder("Enter your password")
      .fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page).toHaveURL("/");
  });
});

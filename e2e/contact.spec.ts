import { test, expect } from "@playwright/test";

test("submits the feedback form", async ({ page }) => {
  let requestBody: unknown;

  await page.route("**/v1/contact", async (route) => {
    requestBody = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/contact");

  await page.getByPlaceholder("Enter your first name").fill("Taylor");
  await page.getByPlaceholder("Enter your last name").fill("Morgan");
  await page
    .getByPlaceholder("Enter your email")
    .fill("taylor.morgan@example.com");
  await page
    .getByPlaceholder("Enter your feedback")
    .fill("Love the new saved searches feature!");

  await page.getByRole("button", { name: "Submit Feedback" }).click();

  await expect(page.getByText("Thank you for your feedback")).toBeVisible();
  expect(requestBody).toMatchObject({
    kind: "feedback",
    firstName: "Taylor",
    lastName: "Morgan",
    email: "taylor.morgan@example.com",
    message: "Love the new saved searches feature!",
  });
});

test("shows an error and lets the visitor retry when the API call fails", async ({
  page,
}) => {
  await page.route("**/v1/contact", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/contact");

  await page.getByPlaceholder("Enter your first name").fill("Taylor");
  await page.getByPlaceholder("Enter your last name").fill("Morgan");
  await page
    .getByPlaceholder("Enter your email")
    .fill("taylor.morgan@example.com");
  await page
    .getByPlaceholder("Enter your feedback")
    .fill("Love the new saved searches feature!");

  await page.getByRole("button", { name: "Submit Feedback" }).click();

  await expect(
    page.getByText("We encountered an error. Please try again"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Feedback" })).toBeEnabled();
});

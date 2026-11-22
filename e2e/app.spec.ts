import { expect, test } from "@playwright/test";
import { logIn, logOut, navTo } from "./helpers";

test.describe("swiping", () => {
  test("save a listing, see it in Saved, and undo a pass", async ({ page }) => {
    await page.goto("./");
    const topCard = page.getByTestId("property-card").last();
    const firstAddress = await topCard.getByRole("heading").textContent();

    await page.getByRole("button", { name: "Save this property" }).click();
    await expect(page.getByRole("heading", { name: firstAddress! })).toBeHidden();

    // Pass on the next one, then undo: it comes back on top.
    const secondAddress = await page.getByTestId("property-card").last().getByRole("heading").textContent();
    await page.getByRole("button", { name: "Pass on this property" }).click();
    await expect(page.getByRole("heading", { name: secondAddress! })).toBeHidden();
    await page.getByRole("button", { name: "Undo last swipe" }).click();
    await expect(page.getByTestId("property-card").last().getByRole("heading")).toHaveText(secondAddress!);

    await navTo(page, /^Saved/);
    await expect(page.getByTestId("saved-list").getByText(firstAddress!)).toBeVisible();
  });

  test("price filter needs a listing type first", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(page.getByLabel("Min price")).toBeDisabled();
    await page.getByLabel("Listing type").selectOption("rent");
    await expect(page.getByLabel(/Min rent/)).toBeEnabled();
  });
});

test.describe("routing on GitHub Pages", () => {
  test("a hard refresh on a deep link lands on that page", async ({ page }) => {
    const response = await page.goto("settings");
    expect(response?.status()).toBe(404); // served by 404.html, which redirects...
    await expect(page).toHaveURL(/\/bridge-web\/settings$/); // ...back to the clean URL
    await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  });

  test("deep links keep their query string", async ({ page }) => {
    await page.goto("property/p1?ref=share");
    await expect(page).toHaveURL(/\/bridge-web\/property\/p1\?ref=share$/);
    await expect(page.getByRole("heading", { name: "142 Maple Street" })).toBeVisible();
  });

  test("old hash-router links still work", async ({ page }) => {
    await page.goto("./#/settings");
    await expect(page).toHaveURL(/\/bridge-web\/settings$/);
    await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  });

  test("guarded pages send guests to log in, then back", async ({ page }) => {
    await page.goto("viewings");
    await expect(page.getByTestId("login-form")).toBeVisible();
    const form = page.getByTestId("login-form");
    await form.getByLabel("Email").fill("usera@abc.com");
    await form.getByLabel("Password").fill("password123");
    await form.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/viewings$/);
    await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
  });
});

test.describe("roles and ownership", () => {
  test("each landlord manages only their own listings", async ({ page }) => {
    await logIn(page, "landlorda@abc.com");
    await navTo(page, /^Manage listings/);
    await expect(page.getByTestId("manage-listings-list").getByRole("listitem")).toHaveCount(6);
    await expect(page.getByText("142 Maple Street")).toBeVisible();
    await expect(page.getByText("64 Birchwood Ln")).toBeHidden(); // landlord B's

    await logOut(page);
    await logIn(page, "landlordb@abc.com");
    await navTo(page, /^Manage listings/);
    await expect(page.getByText("64 Birchwood Ln")).toBeVisible();
  });

  test("tenant reports, trader quotes, owner accepts", async ({ page }) => {
    await logIn(page, "usera@abc.com");
    await navTo(page, /^Issues/);
    await page.getByRole("button", { name: "Report an issue" }).click();
    await page.getByLabel("Property").selectOption("p3");
    await page.getByLabel("Title").fill("Window won't close");
    await page.getByLabel("Description").fill("Bedroom window is stuck open.");
    await page.getByRole("button", { name: "Report issue" }).click();
    await expect(page.getByRole("heading", { name: "Window won't close" })).toBeVisible();

    await logOut(page);
    await logIn(page, "tradea@abc.com");
    await navTo(page, /^Issues/);
    const issue = page.locator(".issue-list__item", { hasText: "Window won't close" });
    await issue.getByRole("button", { name: "Your quote" }).click();
    await issue.getByLabel("Quote amount ($)").fill("140");
    await issue.getByLabel("Message").fill("Can fix it tomorrow.");
    await issue.getByRole("button", { name: "Tender a quote" }).click();
    await expect(issue.getByText("already tendered")).toBeVisible();

    await logOut(page);
    await logIn(page, "landlorda@abc.com");
    await navTo(page, /^Issues/);
    await issue.getByRole("button", { name: "Tenders (1)" }).click();
    await issue.getByRole("button", { name: "Accept tender" }).click();
    await expect(issue.getByText("Accepted")).toBeVisible();
  });
});

test("signing in or out in one tab updates other open tabs", async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await second.goto("settings");
  await expect(second.getByText("You're not signed in.")).toBeVisible();

  await logIn(first, "usera@abc.com");
  await expect(second.getByText("usera@abc.com", { exact: true })).toBeVisible();

  await logOut(first);
  await expect(second.getByText("You're not signed in.")).toBeVisible();
});

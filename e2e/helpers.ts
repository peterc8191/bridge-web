import { expect, type Page } from "@playwright/test";

/** Clicks a nav entry on desktop (inline row) or mobile (behind "More"). */
export async function navTo(page: Page, name: RegExp) {
  const nav = page.getByRole("navigation", { name: "Primary" });
  const inline = nav.locator(".nav-bar__desktop-links").getByRole("link", { name });
  if (await inline.isVisible()) {
    await inline.click();
    return;
  }
  await nav.locator(".nav-bar__more-button").click();
  await page.getByRole("menuitem", { name }).click();
}

export async function logIn(page: Page, email: string) {
  await page.goto("login");
  const form = page.getByTestId("login-form");
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill("password123");
  await form.getByRole("button", { name: "Log in" }).click();
  await expect(form).toBeHidden();
}

export async function logOut(page: Page) {
  await page.goto("settings");
  await page.locator(".settings-section").getByRole("button", { name: "Log out" }).click();
}

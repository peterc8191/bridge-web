import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { logIn } from "./helpers";

// Fails on serious/critical WCAG 2.1 A/AA violations. Minor/moderate ones are
// printed so they're visible without blocking CI.
async function expectAccessible(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  for (const v of results.violations) {
    console.log(`[axe] ${v.impact}: ${v.id} - ${v.help}`);
    for (const node of v.nodes) {
      console.log(`  at ${node.target.join(" ")}: ${node.failureSummary?.split("\n").slice(1).join(" ")}`);
    }
  }
  expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const path of ["./", "saved", "settings", "login", "register", "property/p1"]) {
      test(`${path} has no serious accessibility violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expectAccessible(page);
      });
    }

    test("signed-in pages have no serious accessibility violations", async ({ page }) => {
      await logIn(page, "landlorda@abc.com");
      for (const path of ["issues", "viewings", "manage-listings", "manage-listings/new"]) {
        await page.goto(path);
        await expectAccessible(page);
      }
    });
  });
}

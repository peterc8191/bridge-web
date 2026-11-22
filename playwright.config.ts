import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Runs against the production build served like GitHub Pages
// (see e2e/pages-server.mjs). `npm run test:e2e` builds first.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/bridge-web/`,
    trace: "retain-on-failure",
    // Service workers would cache between tests; each test should start clean.
    serviceWorkers: "block",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node e2e/pages-server.mjs",
    url: `http://localhost:${PORT}/bridge-web/`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
});

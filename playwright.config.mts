import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * These drive a real browser against a real Next.js build. Playwright starts
 * the dev server itself unless one is already running on the port.
 *
 * Scope note: everything here exercises the PUBLIC surface — landing page,
 * pricing, login, routing and guards. Journeys behind a login (shift lifecycle,
 * reconciliation, POS) are written but skipped until credentials are supplied
 * via E2E_EMAIL / E2E_PASSWORD, because they would otherwise have to run
 * against live data. See e2e/authenticated.spec.ts.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // Both browser projects share one Next server. At full parallelism its image
  // cache throws (LRUCache: calculateSize returned 0) and unrelated page loads
  // fail, producing failures that vanish when a test is run alone. Capping the
  // workers keeps the suite reproducible, which matters more here than speed.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3111",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The review raised several mobile layout defects, so the suite checks a
    // phone viewport too rather than assuming desktop behaviour carries over.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    // Production build, not dev: the dev server compiles on first request and
    // took minutes to answer, which made the suite look hung. `npm start`
    // serves the already-built app and is also closer to what ships.
    command: "npm start -- -p 3111",
    url: process.env.E2E_BASE_URL || "http://localhost:3111",
    // false — a stale or unrelated server on the port would silently serve a
    // DIFFERENT app and every assertion would be meaningless. This suite was
    // first run against another project that happened to hold port 3000.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});

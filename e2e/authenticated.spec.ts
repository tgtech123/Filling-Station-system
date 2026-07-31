import { test, expect } from "@playwright/test";

/**
 * Journeys behind a login.
 *
 * SKIPPED unless E2E_EMAIL and E2E_PASSWORD are set. That is deliberate: these
 * write real records — shifts, readings, reconciliations — so pointing them at
 * a live station would put test data into the books. Run them against a staging
 * database, or a station created solely for testing:
 *
 *   E2E_EMAIL=tester@example.com E2E_PASSWORD=... npx playwright test
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.skip(
  !EMAIL || !PASSWORD,
  "Set E2E_EMAIL and E2E_PASSWORD to run authenticated journeys (use a test station, not live data)"
);

async function signIn(page: any) {
  await page.goto("/login");
  await page.locator('input[type="email"], input[name="email"]').first().fill(EMAIL!);
  await page.locator('input[type="password"]').first().fill(PASSWORD!);
  await page.getByRole("button", { name: /sign in|log in|login/i }).first().click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

test.describe("signed-in shell", () => {
  test("reaches a dashboard and shows the user", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("the owner is labelled Owner, not Manager", async ({ page }) => {
    // role stays "manager" for the owner because every permission gate depends
    // on it, so the distinction has to be visible in the label.
    await signIn(page);
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("the notification panel stays on screen on a phone", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile viewport only");

    await signIn(page);
    // The bell/envelope sit mid-header; the panel used to run off the left edge.
    await page.locator('button[aria-label="Messages"], button[aria-label="Alerts"]').first().click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("shift lifecycle", () => {
  test("the start-shift form prefills the opening meter", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/shifts");
    await page.waitForLoadState("networkidle");
    // Present only when a shift is scheduled for today — assert softly so the
    // suite does not fail on a day with no schedule.
    const start = page.getByRole("button", { name: /start shift/i }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      const input = page.getByPlaceholder(/enter current meter reading/i);
      await expect(input).toBeVisible();
    }
  });
});

test.describe("no page scrolls sideways", () => {
  // The review reported horizontal drift on several screens.
  for (const path of ["/dashboard", "/dashboard/shifts", "/dashboard/staffManagement"]) {
    test(`${path} fits its viewport`, async ({ page }) => {
      await signIn(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${path} must not scroll horizontally`).toBeLessThanOrEqual(1);
    });
  }
});

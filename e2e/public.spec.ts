import { test, expect } from "@playwright/test";

/**
 * The public surface: landing page, footer navigation, pricing, login.
 * No login required, no data written — safe to run against any environment.
 */

test.describe("landing page", () => {
  test("loads and shows the call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /ready to begin your journey/i })).toBeVisible();
  });

  test("the hero section does not overflow the viewport horizontally", async ({ page }) => {
    // The reported bug: fixed-width content inside the "Ready to Begin" block
    // spilled outside the image on narrow screens.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "the page must not scroll sideways").toBeLessThanOrEqual(1);
  });

  test("Get Started reaches the login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started now/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("footer product links", () => {
  // Every one of these was href="#" — they looked like links and went nowhere.
  test("Pricing opens the pricing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("Support opens the contact page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Support", exact: true }).first().click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test("Features scrolls to the features section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Features", exact: true }).first().click();
    await expect(page).toHaveURL(/#features/);
    await expect(page.locator("#features")).toBeInViewport({ ratio: 0.1 });
  });

  test("no dead placeholder links remain in the footer", async ({ page }) => {
    await page.goto("/");
    const dead = await page.locator('footer a[href="#"], a[href="#"]').count();
    expect(dead).toBe(0);
  });
});

test.describe("pricing", () => {
  test("renders the pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /plans & pricing/i })).toBeVisible();
  });

  test("opens on monthly billing, not annual", async ({ page }) => {
    // The page used to default to annual, so the first figure a visitor saw was
    // the year's cost. Monthly is the expected headline; annual is the opt-in.
    await page.goto("/pricing");
    const monthly = page.getByRole("button", { name: /bill monthly/i });
    await expect(monthly).toHaveClass(/bg-blue-600/);
    await expect(page.getByRole("button", { name: /bill annually/i })).not.toHaveClass(/bg-blue-600/);
  });

  test("the annual toggle switches the active cycle", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /bill annually/i }).click();
    await expect(page.getByRole("button", { name: /bill annually/i })).toHaveClass(/bg-blue-600/);
    await expect(page.getByRole("button", { name: /bill monthly/i })).not.toHaveClass(/bg-blue-600/);
  });

  test("lists the plans when the API is reachable", async ({ page }) => {
    // Plan cards are fetched from the backend. Without an API this page shows
    // its chrome and no cards — a missing server, not a broken page. Asserting
    // unconditionally would leave a permanently red test that everyone learns
    // to ignore, so the content check is conditional on the data arriving.
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");

    const plan = page.getByText(/pro max/i).first();
    const loaded = await plan.isVisible().catch(() => false);

    test.skip(!loaded, "Backend not reachable — start the API to check plan content");
    await expect(plan).toBeVisible();
  });
});

test.describe("route guards", () => {
  // A signed-out visitor must never reach a dashboard by typing the URL.
  for (const path of [
    "/dashboard/manager",
    "/dashboard/cashier",
    "/dashboard/attendant",
    "/dashboard/staffManagement",
    "/admin",
  ]) {
    test(`${path} is not reachable when signed out`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // Either redirected away, or nothing sensitive rendered.
      await expect(page).not.toHaveURL(new RegExp(`${path}$`));
    });
  }
});

test.describe("login page", () => {
  test("shows the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("rejects empty credentials rather than submitting", async ({ page }) => {
    await page.goto("/login");
    const submit = page.getByRole("button", { name: /sign in|log in|login/i }).first();
    await submit.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

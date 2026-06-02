import { test, expect } from "@playwright/test";
import { config } from "../../config";

/**
 * Dashboard UI tests — add specs under playwright/tests/dashboard/
 * baseURL is SALEOR_DASHBOARD_URL (default http://localhost:9000)
 */
test.describe("Dashboard", () => {
  test("login page is reachable", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill(config.adminEmail);
    await page.getByLabel("Password").fill(config.adminPassword);
    // Continue with your login flow and assertions
  });
});

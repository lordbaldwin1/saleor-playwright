import { test, expect } from "@playwright/test";

/**
 * Storefront UI tests — add specs under playwright/tests/storefront/
 * baseURL is SALEOR_STOREFRONT_URL (default http://localhost:3000)
 */
test.describe("Storefront", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });
});

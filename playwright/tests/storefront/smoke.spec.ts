import test, { expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";

test.describe("Smoke", () => {
  test("Homepage loads", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.productList).toBeVisible();
  });
});

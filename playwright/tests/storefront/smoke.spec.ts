import { test, expect } from "../../fixtures";

test.describe("Smoke", () => {
  test("Homepage loads", async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productList).toBeVisible();
  });
});

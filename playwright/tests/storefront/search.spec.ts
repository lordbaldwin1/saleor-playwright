import { test, expect } from "../../fixtures";

test.describe("Search", () => {
  test("should search for a product", async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.navigation.searchInput).toBeVisible();

  });
});
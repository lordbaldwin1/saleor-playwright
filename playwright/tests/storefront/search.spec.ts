import { test, expect } from "../../fixtures";

test.describe("Search", () => {
  test("should search for a product", async ({ homePage, testProduct }) => {
    await homePage.goto();

    const searchPage = await homePage.navigation.search(
      testProduct.searchQuery,
    );
    await expect(searchPage.resultsText).toBeVisible();
    await expect(searchPage.resultsText).toContainText(
      `Results for "${testProduct.searchQuery}"`,
    );
    await expect(
      await searchPage.findProductInResults(testProduct.name),
    ).toBeVisible();
  });
});

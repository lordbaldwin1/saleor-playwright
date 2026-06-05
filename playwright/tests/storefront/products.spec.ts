import { test, expect } from "../../fixtures";

test.describe("Products", () => {
  test("should display products", async ({ productsPage }) => {
    await productsPage.goto();
    await expect(productsPage.productListContainer).toBeVisible();
    expect(await productsPage.productCards.count()).toBeGreaterThan(0);
  });

  test("should navigate to product details page", async ({
    productsPage,
    testProduct,
  }) => {
    await productsPage.goto();
    const productDetailPage =
      await productsPage.findAndNavigateToProductDetailPage(testProduct.name);
    await expect(productDetailPage.addToBagButton).toBeVisible();
  });
});

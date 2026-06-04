import { test, expect } from "../../fixtures";
import { ProductsPage } from "../../pages/ProductsPage";

test.describe("Products", () => {
  test("should display products", async ({ productsPage }) => {
    await productsPage.goto();
    await expect(productsPage.productListContainer).toBeVisible();
    expect(await productsPage.productCards.count()).toBeGreaterThan(0);
  });

  test("should navigate to product details page", async ({ productsPage, allProductName }) => {
    await productsPage.goto();
    const productDetailPage = await productsPage.navigateToProductDetailPage(allProductName);
    await expect(productDetailPage.addToBagButton).toBeVisible();
  });
});
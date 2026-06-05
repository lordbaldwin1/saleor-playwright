import { test, expect } from "../../fixtures";

test.describe("Product Detail", () => {
  test("should add product to bag", async ({ productsPage, testProduct }) => {
    await productsPage.goto();
  
    const productDetailPage = await productsPage.findAndNavigateToProductDetailPage(testProduct.name);
    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productName).toContainText(testProduct.name);
    await expect(productDetailPage.addToBagButton).toBeVisible();
    await expect(productDetailPage.price).toBeVisible();

    await productDetailPage.addToBagButton.click();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");
  });
}); 
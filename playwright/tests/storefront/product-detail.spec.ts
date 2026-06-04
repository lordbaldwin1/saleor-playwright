import { test, expect } from "../../fixtures";

test.describe("Product Detail", () => {
  test("should add product to bag", async ({ productsPage, allProductName }) => {
    await productsPage.goto();
  
    const productDetailPage = await productsPage.navigateToProductDetailPage(allProductName);
    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productName).toContainText(allProductName);
    await expect(productDetailPage.addToBagButton).toBeVisible();
    await expect(productDetailPage.price).toBeVisible();

    await productDetailPage.addToBagButton.click();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");
  });
});
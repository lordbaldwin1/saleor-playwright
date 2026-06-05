import { test, expect } from "../../fixtures";

test.describe("Cart", () => {
  test("should add product without variants to cart", async ({ productsPage, testProduct }) => {
    await productsPage.goto();
    const productDetailPage = await productsPage.findAndNavigateToProductDetailPage(testProduct.name);
    await expect(productDetailPage.addToBagButton).toBeEnabled();

    await productDetailPage.addToBagButton.click();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");

    await productDetailPage.navigation.goToCart();
    await expect(productDetailPage.navigation.cart.dialog).toBeVisible();

    await expect(productDetailPage.navigation.cart.cartItems).toHaveCount(1);
    expect(productDetailPage.navigation.cart.cartTotal).toContainText(testProduct.price!);
  });
});
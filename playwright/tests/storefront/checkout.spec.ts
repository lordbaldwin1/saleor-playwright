import { test, expect } from "../../fixtures";

test.describe("Checkout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should complete guest checkout", async ({
    productsPage,
    checkoutPage,
    testProduct,
    checkout,
  }) => {
    await productsPage.goto();
    const productDetailPage = await productsPage.findAndNavigateToProductDetailPage(testProduct.name);

    await productDetailPage.addToBag();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");

    await productDetailPage.navigation.goToCart();
    await expect(productDetailPage.navigation.cart.dialog).toBeVisible();
    await expect(productDetailPage.navigation.cart.cartItems).toHaveCount(1);
    expect(productDetailPage.navigation.cart.cartTotal).toContainText(testProduct.price!);

    await productDetailPage.navigation.cart.checkout();
    await expect(checkoutPage.contactInput).toBeVisible();

    await checkoutPage.fillShippingForm(checkout.shipping);
    await checkoutPage.continueToShipping();

    await expect(checkoutPage.shippingMethodHeading).toBeVisible();
    await checkoutPage.selectDefaultShippingMethod();
    await expect(checkoutPage.continueToPaymentButton).toBeEnabled();
    await checkoutPage.continueToPayment();

    await expect(checkoutPage.paymentHeading).toBeVisible();
    await checkoutPage.fillCreditCardForm(checkout.creditCard);
    const confirmationPage = await checkoutPage.pay();

    await expect(confirmationPage.thankYouHeading).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^Order #\d+$/);
    await expect(confirmationPage.confirmationEmail).toHaveText(checkout.shipping.email);
    await expect(confirmationPage.shippingAddress).toContainText(checkout.shipping.streetAddress);
    await expect(confirmationPage.shippingAddress).toContainText(checkout.shipping.city, { ignoreCase: true });
    await expect(confirmationPage.shippingAddress).toContainText(checkout.shipping.postalCode!);
    await expect(confirmationPage.orderItems).toHaveCount(1);
    await expect(confirmationPage.orderItems).toContainText(testProduct.name);
    await expect(confirmationPage.orderTotal).toHaveText(`$${testProduct.price}`);
  });
});

import { test, expect } from "../../fixtures";

test.describe("Guest checkout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should complete guest checkout", async ({
    productsPage,
    testProduct,
    guestCheckout,
  }) => {
    await productsPage.goto();
    const productDetailPage =
      await productsPage.findAndNavigateToProductDetailPage(testProduct.name);

    await productDetailPage.addToBag();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");

    await productDetailPage.navigation.goToCart();
    await expect(productDetailPage.navigation.cart.dialog).toBeVisible();
    await expect(productDetailPage.navigation.cart.cartItems).toHaveCount(1);
    await expect(productDetailPage.navigation.cart.cartTotal).toContainText(
      testProduct.price!,
    );

    const checkoutPage = await productDetailPage.navigation.cart.checkout();
    await expect(checkoutPage.contactInput).toBeVisible();

    await checkoutPage.fillShippingForm(guestCheckout.shipping);
    await expect(checkoutPage.continueToShippingButton).toBeEnabled();
    await checkoutPage.continueToShipping();

    await expect(checkoutPage.shippingMethodHeading).toBeVisible();
    await checkoutPage.selectDefaultShippingMethod();
    await expect(checkoutPage.continueToPaymentButton).toBeEnabled();
    await checkoutPage.continueToPayment();

    await expect(checkoutPage.paymentHeading).toBeVisible();
    await checkoutPage.fillCreditCardForm(guestCheckout.creditCard);
    const confirmationPage = await checkoutPage.pay();

    await expect(confirmationPage.thankYouHeading).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^Order #\d+$/);
    await expect(confirmationPage.confirmationEmail).toHaveText(
      guestCheckout.shipping.email,
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      guestCheckout.shipping.streetAddress,
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      guestCheckout.shipping.city,
      { ignoreCase: true },
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      guestCheckout.shipping.postalCode!,
    );
    await expect(confirmationPage.orderItems).toHaveCount(1);
    await expect(confirmationPage.orderItems).toContainText(testProduct.name);
    await expect(confirmationPage.orderTotal).toHaveText(
      `$${testProduct.price}`,
    );

    const homePage = await confirmationPage.continueShopping();
    await expect(homePage.productList).toBeVisible();
    await expect(homePage.navigation.cartLink).toContainText("0");
  });

  test("discount voucher and shipping cost should be applied to order", async ({
    productsPage,
    voucherCode,
    testProduct,
    guestCheckout,
  }) => {
    await productsPage.goto();
    const productDetailPage =
      await productsPage.findAndNavigateToProductDetailPage(testProduct.name);

    await productDetailPage.addToBag();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");
    await productDetailPage.navigation.goToCart();
    await expect(
      productDetailPage.navigation.cart.checkoutButton,
    ).toBeEnabled();

    const checkoutPage = await productDetailPage.navigation.cart.checkout();
    await expect(checkoutPage.contactInput).toBeVisible();

    await checkoutPage.fillShippingForm(guestCheckout.shipping);
    await expect(checkoutPage.continueToShippingButton).toBeEnabled();
    await checkoutPage.continueToShipping();
    await expect(checkoutPage.shippingMethodHeading).toBeVisible();

    await checkoutPage.selectFirstEMSShippingMethod();
    await expect(checkoutPage.continueToPaymentButton).toBeEnabled();
    await checkoutPage.continueToPayment();

    // discount code & shipping cost
    const originalOrderSubtotalCost =
      await checkoutPage.getOrderSummarySubtotalAmount();
    const originalOrderTotalCost =
      await checkoutPage.getOrderSummaryTotalAmount();

    await expect(checkoutPage.voucherCodeInput).toBeVisible();
    await checkoutPage.voucherCodeInput.fill(voucherCode.code);
    await checkoutPage.applyVoucherButton.click();
    await expect(checkoutPage.validVoucherCard).toBeVisible();
    await expect(checkoutPage.orderSummaryDiscount).toContainText(
      `-$${voucherCode.discountValue}`,
    );

    // notes for when I return to this:
    // check that subtotal cost goes down by discount value
    // check that total cost goes down by discount value but up by shipping cost
    // get shipping cost from shipping method row and check that order summary is accurate?
  });
});

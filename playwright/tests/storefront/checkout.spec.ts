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
    await expect(productDetailPage.navigation.cart.cartItems).toHaveCount(1);
    await expect(productDetailPage.navigation.cart.cartTotal).toContainText(
      testProduct.price!,
    );

    const checkoutPage = await productDetailPage.navigation.cart.checkout();
    await checkoutPage.fillShippingForm(guestCheckout.shipping);
    await checkoutPage.continueToShipping();
    await checkoutPage.selectDefaultShippingMethod();
    await checkoutPage.continueToPayment();
    await checkoutPage.fillCreditCardForm(guestCheckout.creditCard);
    const confirmationPage = await checkoutPage.pay();

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
    await expect(homePage.navigation.cartLink).toContainText("0");
  });

  test("discount voucher and shipping cost should be applied to order", async ({
    productsPage,
    voucherCode,
    testProduct,
    guestCheckoutNonDefaultShippingMethod: checkoutData,
  }) => {
    await productsPage.goto();
    const productDetailPage =
      await productsPage.findAndNavigateToProductDetailPage(testProduct.name);
    await productDetailPage.addToBag();
    await expect(productDetailPage.navigation.cartLink).toContainText("1");

    await productDetailPage.navigation.goToCart();
    const checkoutPage = await productDetailPage.navigation.cart.checkout();

    await checkoutPage.fillShippingForm(checkoutData.shipping);
    await checkoutPage.continueToShipping();

    // discount code & shipping cost
    const { total: originalTotal, subtotal: originalSubtotal } =
      await checkoutPage.getOrderSummaryTotalAndSubtotal();
    const shippingCost = await checkoutPage.selectShippingMethod(
      checkoutData.shippingMethod,
    );
    await checkoutPage.continueToPayment();
    await checkoutPage.applyVoucherCode(voucherCode.code);

    // order summary checks
    const { total: finalTotal, subtotal: finalSubtotal } =
      await checkoutPage.getOrderSummaryTotalAndSubtotal();
    expect(finalSubtotal).toBe(originalSubtotal - voucherCode.discountValue);
    expect(finalTotal).toBe(
      originalTotal - voucherCode.discountValue + shippingCost,
    );
    await expect(checkoutPage.orderSummaryDiscount).toContainText(
      `-$${voucherCode.discountValue}`,
    );

    // payment page checks
    await expect(checkoutPage.contactSummary).toContainText(
      checkoutData.shipping.email,
    );
    await expect(checkoutPage.shipToSummary).toContainText(
      checkoutData.shipping.streetAddress,
    );
    await expect(checkoutPage.shipToSummary).toContainText(
      checkoutData.shipping.city,
      { ignoreCase: true },
    );
    await expect(checkoutPage.shipToSummary).toContainText(
      checkoutData.shipping.postalCode!,
    );
    await expect(checkoutPage.shippingMethodSummary).toContainText(
      checkoutData.shippingMethod,
    );

    await checkoutPage.fillCreditCardForm(checkoutData.creditCard);
    const confirmationPage = await checkoutPage.pay();

    // confirmation page checks
    await expect(confirmationPage.orderNumber).toHaveText(/^Order #\d+$/);
    await expect(confirmationPage.confirmationEmail).toHaveText(
      checkoutData.shipping.email,
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      checkoutData.shipping.streetAddress,
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      checkoutData.shipping.city,
      { ignoreCase: true },
    );
    await expect(confirmationPage.shippingAddress).toContainText(
      checkoutData.shipping.postalCode!,
    );

    await expect(confirmationPage.billingAddress).toContainText(
      checkoutData.shipping.streetAddress,
    );
    await expect(confirmationPage.billingAddress).toContainText(
      checkoutData.shipping.city,
      { ignoreCase: true },
    );
    await expect(confirmationPage.billingAddress).toContainText(
      checkoutData.shipping.postalCode!,
    );
    await expect(confirmationPage.estimatedDelivery).toBeVisible();

    const homePage = await confirmationPage.continueShopping();
    await expect(homePage.navigation.cartLink).toContainText("0");
  });
});

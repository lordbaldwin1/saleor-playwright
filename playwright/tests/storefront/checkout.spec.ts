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
    guestCheckoutNonDefaultShippingMethod: checkoutData,
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

    await checkoutPage.fillShippingForm(checkoutData.shipping);
    await expect(checkoutPage.continueToShippingButton).toBeEnabled();
    await checkoutPage.continueToShipping();
    await expect(checkoutPage.shippingMethodHeading).toBeVisible();

    // discount code & shipping cost
    if (await checkoutPage.isMobile()) {
      await checkoutPage.toggleMobileOrderSummary();
    }
    const originalOrderSubtotalCost =
      await checkoutPage.getOrderSummarySubtotalAmount();
    const originalOrderTotalCost =
      await checkoutPage.getOrderSummaryTotalAmount();
    const shippingCost = await checkoutPage.selectShippingMethod(checkoutData.shippingMethod);
    await expect(checkoutPage.continueToPaymentButton).toBeEnabled();

    await checkoutPage.continueToPayment();
    await expect(checkoutPage.paymentHeading).toBeVisible();

    if (await checkoutPage.isMobile()) {
      await checkoutPage.toggleMobileOrderSummary();
    }
    await expect(checkoutPage.voucherCodeInput).toBeVisible();
    await checkoutPage.applyVoucherCode(voucherCode.code);
    if (await checkoutPage.isMobile()) {
      await checkoutPage.toggleMobileOrderSummary();
    }
    await expect(checkoutPage.validVoucherCard).toBeVisible();

    // order summary checks
    const finalOrderSubtotalCost =
      await checkoutPage.getOrderSummarySubtotalAmount();
    const finalOrderTotalCost = await checkoutPage.getOrderSummaryTotalAmount();
    expect(finalOrderSubtotalCost).toBe(
      originalOrderSubtotalCost - voucherCode.discountValue,
    );
    expect(finalOrderTotalCost).toBe(
      originalOrderTotalCost - voucherCode.discountValue + shippingCost,
    );
    await expect(checkoutPage.orderSummaryDiscount).toContainText(
      `-$${voucherCode.discountValue}`,
    );

    // payment page checks
    await expect(checkoutPage.contactSummary).toContainText(checkoutData.shipping.email);
    await expect(checkoutPage.shipToSummary).toContainText(checkoutData.shipping.streetAddress);
    await expect(checkoutPage.shipToSummary).toContainText(checkoutData.shipping.city, { ignoreCase: true });
    await expect(checkoutPage.shipToSummary).toContainText(checkoutData.shipping.postalCode!);
    await expect(checkoutPage.shippingMethodSummary).toContainText(checkoutData.shippingMethod);

    await checkoutPage.fillCreditCardForm(checkoutData.creditCard);
    await expect(checkoutPage.payButton).toBeEnabled();
    const confirmationPage = await checkoutPage.pay();

    await expect(confirmationPage.thankYouHeading).toBeVisible();
    await expect(confirmationPage.orderNumber).toHaveText(/^Order #\d+$/);
    await expect(confirmationPage.confirmationEmail).toHaveText(checkoutData.shipping.email);
    await expect(confirmationPage.shippingAddress).toContainText(checkoutData.shipping.streetAddress);
    await expect(confirmationPage.shippingAddress).toContainText(checkoutData.shipping.city, { ignoreCase: true });
    await expect(confirmationPage.shippingAddress).toContainText(checkoutData.shipping.postalCode!);

    await expect(confirmationPage.billingAddress).toContainText(checkoutData.shipping.streetAddress);
    await expect(confirmationPage.billingAddress).toContainText(checkoutData.shipping.city, { ignoreCase: true });
    await expect(confirmationPage.billingAddress).toContainText(checkoutData.shipping.postalCode!);
    await expect(confirmationPage.estimatedDelivery).toBeVisible();

    const homePage = await confirmationPage.continueShopping();
    await expect(homePage.productList).toBeVisible();
    await expect(homePage.navigation.cartLink).toContainText("0");
  });
});

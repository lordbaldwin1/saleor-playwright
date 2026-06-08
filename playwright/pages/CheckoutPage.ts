import { Locator, Page } from "@playwright/test";
import type { CreditCardDetails, ShippingDetails, ShippingMethods } from "../helpers/test-data";
import { Navigation } from "./Navigation";
import { OrderConfirmationPage } from "./OrderConfirmationPage";
import { BasePage } from "./BasePage";

export class CheckoutPage extends BasePage {
  readonly navigation: Navigation;
  
  // shipping form
  readonly contactInput: Locator;
  readonly shippingCountryRegionSelect: Locator;
  readonly shippingFirstNameInput: Locator;
  readonly shippingLastNameInput: Locator;
  readonly shippingCompanyInput: Locator;
  readonly shippingStreetAddressInput: Locator;
  readonly shippingStreetAddress2Input: Locator;
  readonly shippingCityInput: Locator;
  readonly shippingPostalCodeInput: Locator;
  readonly shippingStateSelect: Locator;
  readonly shippingPhoneInput: Locator;
  readonly continueToShippingButton: Locator;

  // shipping method
  readonly contactSummary: Locator;
  readonly shipToSummary: Locator;
  readonly shippingMethodHeading: Locator;
  readonly continueToPaymentButton: Locator;
  readonly returnToInformationButton: Locator;
  readonly shippingMethods: Locator;
  readonly shippingMethodSummary: Locator;

  // payment
  readonly paymentHeading: Locator;
  readonly creditCardRadio: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly cardNameInput: Locator;
  readonly payButton: Locator;
  readonly returnToShippingButton: Locator;

  // order summary
  readonly mobileOrderSummaryExpandButton: Locator;
  readonly orderSummary: Locator;
  readonly voucherCodeInput: Locator;
  readonly applyVoucherButton: Locator;
  readonly validVoucherCard: Locator;
  readonly costBreakdown: Locator;
  readonly orderSummarySubtotal: Locator;
  readonly orderSummaryShipping: Locator;
  readonly orderSummaryDiscount: Locator;
  readonly orderSummaryTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new Navigation(this.page);

    // shipping form
    this.contactInput = this.page.getByPlaceholder("Email address");
    this.shippingCountryRegionSelect = this.page.getByLabel("Country/Region");
    this.shippingFirstNameInput = this.page.getByLabel("First name");
    this.shippingLastNameInput = this.page.getByLabel("Last name");
    this.shippingCompanyInput = this.page.getByLabel(/Company/);
    this.shippingStreetAddressInput = this.page.getByLabel("Street address");
    this.shippingStreetAddress2Input = this.page.getByLabel(
      /Apartment, suite, etc\./,
    );
    this.shippingCityInput = this.page.getByLabel("City");
    this.shippingPostalCodeInput = this.page.getByLabel(/(zip|postal)\s*code/i);
    this.shippingStateSelect = this.page.getByLabel("State");
    this.shippingPhoneInput = this.page.getByLabel(/Phone number/);
    this.continueToShippingButton = this.page.getByRole("button", {
      name: "Continue to shipping",
    });

    // shipping method
    this.contactSummary = this.page
      .locator("div.flex.items-start.gap-4.p-4")
      .filter({ has: this.page.getByText("Contact", { exact: true }) })
      .locator("span.break-words");
    this.shipToSummary = this.page
      .locator("div.flex.items-start.gap-4.p-4")
      .filter({ has: this.page.getByText("Ship to", { exact: true }) })
      .locator("span.break-words");
    this.shippingMethodHeading = this.page.getByRole("heading", {
      name: "Shipping method",
    });
    this.continueToPaymentButton = this.page.getByRole("button", {
      name: "Continue to payment",
    });
    this.returnToInformationButton = this.page.getByRole("button", {
      name: "Return to information",
    });
    this.shippingMethodSummary = this.page
      .locator("div.flex.items-start.gap-4.p-4")
      .filter({ has: this.page.getByText("Method", { exact: true }) })
      .locator("span.break-words");
    this.shippingMethods = this.page.locator(
      "label.flex.cursor-pointer",
    );

    // payment
    this.paymentHeading = this.page.getByRole("heading", { name: "Payment" });
    this.creditCardRadio = this.page.getByRole("radio", {
      name: "Credit card",
    });
    this.cardNumberInput = this.page.getByPlaceholder("Card number");
    this.cardExpiryInput = this.page.getByPlaceholder("MM/YY");
    this.cardCvcInput = this.page.getByPlaceholder("CVC");
    this.cardNameInput = this.page.getByPlaceholder("Name on card");
    this.payButton = this.page.getByRole("button", { name: /^Pay \$/ });
    this.returnToShippingButton = this.page.getByRole("button", {
      name: "Return to shipping",
    });

    // order summary — mobile hides the "Order Summary" heading; match the visible article instead
    this.mobileOrderSummaryExpandButton = this.page.getByRole("button", {
      name: /(Show|Hide) order summary/,
    });
    this.orderSummary = this.page.locator(".order-summary-inner").filter({
      visible: true,
    })
    this.voucherCodeInput = this.orderSummary.getByPlaceholder("Discount code");
    this.applyVoucherButton = this.orderSummary.getByRole("button", {
      name: "Apply",
      exact: true,
    });
    this.validVoucherCard = this.orderSummary.locator(".flex.items-center.gap-3.rounded-lg");
    this.costBreakdown = this.orderSummary.locator("dl");
    this.orderSummarySubtotal = this.costBreakdown.locator("div").filter({ hasText: "Subtotal" });
    this.orderSummaryShipping = this.costBreakdown.locator("div").filter({ hasText: "Shipping" });
    this.orderSummaryDiscount = this.costBreakdown.locator("div").filter({ hasText: "Discount" });
    this.orderSummaryTotal = this.orderSummary.locator("div.border-border\\/50.mt-4.flex");
  }

  async fillShippingForm(details: ShippingDetails) {
    if (await this.contactInput.isVisible()) {
      await this.contactInput.fill(details.email);
    }
    await this.shippingCountryRegionSelect.selectOption(details.country);
    await this.shippingFirstNameInput.fill(details.firstName);
    await this.shippingLastNameInput.fill(details.lastName);
    await this.shippingStreetAddressInput.fill(details.streetAddress);
    await this.shippingCityInput.fill(details.city);

    if (details.company) {
      await this.shippingCompanyInput.fill(details.company);
    }
    if (details.streetAddress2) {
      await this.shippingStreetAddress2Input.fill(details.streetAddress2);
    }
    if (details.postalCode) {
      await this.shippingPostalCodeInput.fill(details.postalCode);
    }
    if (details.state) {
      await this.shippingStateSelect.selectOption(details.state);
    }
    if (details.phone) {
      await this.shippingPhoneInput.fill(details.phone);
    }
  }

  async continueToShipping() {
    await this.continueToShippingButton.click();
  }

  async selectDefaultShippingMethod() {
    await this.shippingMethods.first().click();
  }

  async selectShippingMethod(method: ShippingMethods) {
    const shippingRows = this.shippingMethods.filter({ hasText: method });
    const firstShippingRow = shippingRows.first();
    await firstShippingRow.click();

    // get and return shipping cost
    const shippingCost = await firstShippingRow.locator("span").filter({
      hasText: /^\$\d+\.\d{2}$/
    }).textContent();
    if (!shippingCost) {
      throw new Error(`Shipping cost text not found for method: ${method}`);
    }
    const value = shippingCost.split("$")[1];
    if (!value) {
      throw new Error(`Shipping cost not found for method: ${method}`);
    }
    return parseFloat(value);
  }

  async continueToPayment() {
    await this.continueToPaymentButton.click();
  }

  async fillCreditCardForm(details: CreditCardDetails) {
    await this.creditCardRadio.check();
    await this.cardNumberInput.fill(details.cardNumber);
    await this.cardExpiryInput.fill(details.expiry);
    await this.cardCvcInput.fill(details.cvc);
    await this.cardNameInput.fill(details.nameOnCard);
  }

  async getOrderSummarySubtotalAmount() {
    const amountString = await this.orderSummarySubtotal.locator("dd").textContent();
    const value = amountString?.split("$")[1];
    if (!value) {
      throw new Error("Subtotal amount not found");
    }
    return parseFloat(value);
  }

  async getOrderSummaryShippingAmount() {
    const amountString = await this.orderSummaryShipping.locator("dd").textContent();
    const value = amountString?.split("$")[1];
    if (!value) {
      throw new Error("Shipping amount not found");
    }
    return parseFloat(value);
  }

  async getOrderSummaryTotalAmount() {
    const amountString = await this.orderSummaryTotal.locator("data").textContent();
    const value = amountString?.split("$")[1];
    if (!value) {
      throw new Error("Total amount not found");
    }
    return parseFloat(value);
  }

  async applyVoucherCode(code: string) {
    await this.voucherCodeInput.fill(code);
    await this.applyVoucherButton.click();
  }

  async toggleMobileOrderSummary() {
    await this.mobileOrderSummaryExpandButton.click();
  }

  async pay() {
    await this.payButton.click();
    return new OrderConfirmationPage(this.page);
  }
}

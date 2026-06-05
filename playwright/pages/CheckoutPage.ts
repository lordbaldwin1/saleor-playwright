import { expect, Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { OrderConfirmationPage } from "./OrderConfirmationPage";

export type ShippingDetails = {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state?: string;
  company?: string;
  streetAddress2?: string;
  postalCode?: string;
  phone?: string;
};

export type CreditCardDetails = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
};

export class CheckoutPage {
  private readonly page: Page;
  readonly navigation: Navigation;
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
  readonly contactSummary: Locator;
  readonly shipToSummary: Locator;
  readonly shippingMethodHeading: Locator;
  readonly continueToPaymentButton: Locator;
  readonly returnToInformationButton: Locator;
  readonly shippingMethodSummary: Locator;
  readonly shippingMethodRadioButtons: Locator;
  readonly paymentHeading: Locator;
  readonly creditCardRadio: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly cardNameInput: Locator;
  readonly payButton: Locator;
  readonly returnToShippingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new Navigation(this.page);
    this.contactInput = this.page.getByPlaceholder("Email address");
    this.shippingCountryRegionSelect = this.page.getByLabel("Country/Region");
    this.shippingFirstNameInput = this.page.getByLabel("First name");
    this.shippingLastNameInput = this.page.getByLabel("Last name");
    this.shippingCompanyInput = this.page.getByLabel(/Company/);
    this.shippingStreetAddressInput = this.page.getByLabel("Street address");
    this.shippingStreetAddress2Input = this.page.getByLabel(/Apartment, suite, etc\./);
    this.shippingCityInput = this.page.getByLabel("City");
    this.shippingPostalCodeInput = this.page.getByLabel(/code/);
    this.shippingStateSelect = this.page.getByLabel("State"); 
    this.shippingPhoneInput = this.page.getByLabel(/Phone number/);
    this.continueToShippingButton = this.page.getByRole("button", { name: "Continue to shipping" });
    this.contactSummary = this.page
      .locator("div")
      .filter({ has: this.page.getByText("Contact", { exact: true }) })
      .locator("span.break-words");
    this.shipToSummary = this.page
      .locator("div")
      .filter({ has: this.page.getByText("Ship to", { exact: true }) })
      .locator("span.break-words");
    this.shippingMethodHeading = this.page.getByRole("heading", { name: "Shipping method" });
    this.continueToPaymentButton = this.page.getByRole("button", { name: "Continue to payment" });
    this.returnToInformationButton = this.page.getByRole("button", { name: "Return to information" });
    this.shippingMethodSummary = this.page
      .locator("div")
      .filter({ has: this.page.getByText("Method", { exact: true }) })
      .locator("span.break-words");
    this.shippingMethodRadioButtons = this.page.locator("label.flex.cursor-pointer");
    this.paymentHeading = this.page.getByRole("heading", { name: "Payment" });
    this.creditCardRadio = this.page.getByRole("radio", { name: "Credit card" });
    this.cardNumberInput = this.page.getByPlaceholder("Card number");
    this.cardExpiryInput = this.page.getByPlaceholder("MM/YY");
    this.cardCvcInput = this.page.getByPlaceholder("CVC");
    this.cardNameInput = this.page.getByPlaceholder("Name on card");
    this.payButton = this.page.getByRole("button", { name: /^Pay \$/ });
    this.returnToShippingButton = this.page.getByRole("button", { name: "Return to shipping" });
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
    await this.shippingMethodRadioButtons.first().click();
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

  async pay() {
    await this.payButton.click();
    return new OrderConfirmationPage(this.page);
  }
}

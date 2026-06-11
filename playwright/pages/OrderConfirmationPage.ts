import { expect, Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { HomePage } from "./HomePage";
import { BasePage } from "./BasePage";

export class OrderConfirmationPage extends BasePage {
  readonly navigation: Navigation;
  readonly orderNumber: Locator;
  readonly thankYouHeading: Locator;
  readonly confirmationHeading: Locator;
  readonly confirmationEmailMessage: Locator;
  readonly confirmationEmail: Locator;
  readonly shippingAddress: Locator;
  readonly billingAddress: Locator;
  readonly estimatedDelivery: Locator;
  readonly orderItems: Locator;
  readonly orderTotal: Locator;
  readonly continueShoppingLink: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new Navigation(this.page);
    const confirmationCard = this.page
      .locator("div.overflow-hidden.rounded-lg.border")
      .filter({
        has: this.page.getByRole("heading", {
          name: "Your order is confirmed",
        }),
      });

    this.orderNumber = this.page.getByText(/^Order #\d+$/);
    this.thankYouHeading = this.page.getByRole("heading", {
      name: "Thank you for your order!",
    });
    this.confirmationHeading = this.page.getByRole("heading", {
      name: "Your order is confirmed",
    });
    this.confirmationEmailMessage = confirmationCard.getByText(
      /You'll receive a confirmation email at/,
    );
    this.confirmationEmail = confirmationCard
      .locator("div.flex.items-start.gap-3")
      .filter({
        has: this.page.getByText("Confirmation email sent", { exact: true }),
      })
      .locator("p.text-muted-foreground");
    this.shippingAddress = confirmationCard
      .locator("div.flex.items-start.gap-3")
      .filter({ has: this.page.getByText("Shipping address", { exact: true }) })
      .locator("p.text-muted-foreground");
    this.billingAddress = confirmationCard
      .locator("div.flex.items-start.gap-3")
      .filter({ has: this.page.getByText("Billing address", { exact: true }) })
      .locator("p.text-muted-foreground");
    this.estimatedDelivery = confirmationCard
      .locator("div.flex.items-start.gap-3")
      .filter({
        has: this.page.getByText("Estimated delivery", { exact: true }),
      })
      .locator("p.text-muted-foreground");
    this.orderItems = this.page.locator("article").getByRole("listitem");
    this.orderTotal = this.page.locator("article data.text-xl.font-semibold");
    this.continueShoppingLink = this.page.getByRole("link", {
      name: "Continue shopping",
    });
  }

  async continueShopping() {
    await this.continueShoppingLink.click();
    const homePage = new HomePage(this.page);
    await expect(homePage.productList).toBeVisible();
    return homePage;
  }
}

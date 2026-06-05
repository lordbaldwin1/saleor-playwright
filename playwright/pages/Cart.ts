import { Locator, Page } from "@playwright/test";


export class Cart {
  private readonly page: Page;
  readonly dialog: Locator;
  readonly cartItems: Locator;
  readonly cartTotal: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = this.page.locator(".fixed.z-50.gap-4.bg-background");
    this.cartItems = this.page.getByRole("listitem");
    this.cartTotal = this.page.locator(".flex.items-center.justify-between.border-t.border-border.pt-2.text-base.font-semibold");
    this.checkoutButton = this.page.getByRole("link", { name: "Checkout" });
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
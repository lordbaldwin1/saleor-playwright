import { Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { BasePage } from "./BasePage";


export class ProductDetailPage extends BasePage {
  readonly navigation: Navigation;
  readonly productName: Locator;
  readonly addToBagButton: Locator;
  readonly price: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new Navigation(this.page);
    this.productName = this.page.locator(".order-2.text-balance.text-3xl");
    this.addToBagButton = this.page.locator("form > div.space-y-4").getByRole("button", { name: "Add to bag" });
    this.price = this.page.locator(".text-2xl.font-semibold.tracking-tight");
  }

  async addToBag() {
    await this.addToBagButton.click();
  }
}
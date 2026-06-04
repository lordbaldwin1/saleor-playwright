import { Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";


export class ProductDetailPage {
  private readonly page: Page;
  readonly navigation: Navigation;
  readonly productName: Locator;
  readonly addToBagButton: Locator;
  readonly price: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new Navigation(this.page);
    this.productName = this.page.locator(".order-2.text-balance.text-3xl");
    this.addToBagButton = this.page.getByRole("button", { name: "Add to bag" });
    this.price = this.page.locator(".text-2xl.font-semibold.tracking-tight");
  }
}
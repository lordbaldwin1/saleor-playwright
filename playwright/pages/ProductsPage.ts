import { Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { ProductDetailPage } from "./ProductDetailPage";


export class ProductsPage {
  private readonly page: Page;
  readonly navigation: Navigation;
  readonly productListContainer: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new Navigation(this.page);
    this.productListContainer = this.page.locator(".grid.w-full.grid-cols-2");
    this.productCards = this.productListContainer.locator(".group");
  }

  async goto() {
    await this.page.goto("/default-channel/products");
  }

  async navigateToProductDetailPage(productName: string) {
    await this.productCards.getByText(productName).click();
    return new ProductDetailPage(this.page);
  }
}
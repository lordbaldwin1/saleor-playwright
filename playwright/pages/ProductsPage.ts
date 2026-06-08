import { expect, Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { ProductDetailPage } from "./ProductDetailPage";
import { BasePage } from "./BasePage";


export class ProductsPage extends BasePage {
  readonly navigation: Navigation;
  readonly productListContainer: Locator;
  readonly productCards: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new Navigation(this.page);
    this.productListContainer = this.page.locator(".grid.w-full.grid-cols-2");
    this.productCards = this.productListContainer.locator(".group");
    this.nextPageButton = this.page.getByRole("link", { name: "Next" });
    this.previousPageButton = this.page.getByRole("link", { name: "Previous" });
  }

  async goto() {
    await this.page.goto("products");
  }

  async navigateToFirstProductDetailPage() { 
    await this.productCards.first().click();
    return new ProductDetailPage(this.page);
  }

  async navigateToNextPage() {
   await expect(this.nextPageButton).toBeEnabled();
   const href = await this.nextPageButton.getAttribute("href");
   if (!href) {
    throw new Error("Next page button is not enabled");
   }
   await this.page.goto(href);
  }

  async navigateToPreviousPage() {
    await this.previousPageButton.click();
  } 

  async findAndNavigateToProductDetailPage(productName: string) {
    while (await this.nextPageButton.isEnabled()) {
      await expect(this.productListContainer).toBeVisible();
      for (const card of await this.productCards.all()) {
        const name = card.getByRole("heading", { level: 3 });
        if (await name.textContent() === productName) {
          await card.click();
          return new ProductDetailPage(this.page);
        }
      }
      await this.navigateToNextPage();
    }
    throw new Error(`Product "${productName}" not found`);
  }
}
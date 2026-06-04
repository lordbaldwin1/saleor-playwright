import { Locator, Page } from "@playwright/test";


export class ProductsPage {
  private readonly page: Page;
  readonly productList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productList = this.page.getByTestId("ProductList");
  }
}
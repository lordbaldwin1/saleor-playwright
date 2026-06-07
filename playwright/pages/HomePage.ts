import { Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { config } from "../config";


export class HomePage {
  private readonly page: Page;
  readonly navigation: Navigation;
  readonly productList: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new Navigation(this.page);
    this.productList = this.page.getByTestId("ProductList");
    this.loginLink = this.page.getByRole("link", { name: "Log in" });
  }

  async goto() {
    await this.page.goto("/default-channel");
  }
}
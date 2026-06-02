import { Locator, Page } from "@playwright/test";

export type NavigationOptions = "home" | "all" | "apparel" | "accessories" | "groceries" | "login" | "cart";

export class Navigation {
  private readonly page: Page;
  readonly container: Locator;
  readonly homeLink: Locator;
  readonly allLink: Locator;
  readonly apparelLink: Locator;
  readonly accessoriesLink: Locator;
  readonly groceriesLink: Locator;
  readonly loginLink: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = this.page.locator("header");
    this.homeLink = this.container.getByLabel("Homepage");
    this.allLink = this.container.getByRole("link", { name: "All" });
    this.apparelLink = this.container.getByRole("link", { name: "Apparel" });
    this.accessoriesLink = this.container.getByRole("link", {
      name: "Accessories",
    });
    this.groceriesLink = this.container.getByRole("link", {
      name: "Groceries",
    });
    this.loginLink = this.container.getByRole("link", { name: "Log in" });
    this.cartLink = this.container.getByTestId("CartNavItem");
  }

  async goto(option: NavigationOptions) {
    switch (option) {
      case "home":
        await this.homeLink.click();
        break;
      case "all":
        await this.allLink.click();
        break;
      case "apparel":
        await this.apparelLink.click();
        break;
      case "accessories":
        await this.accessoriesLink.click();
        break;
      case "groceries":
        await this.groceriesLink.click();
        break;
      case "login":
        await this.loginLink.click();
        break;
      default:
        throw new Error(`Invalid navigation option: ${option}`);
    }
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async goToAll() {
    await this.allLink.click();
  }

  async goToApparel() {
    await this.apparelLink.click();
  }

  async goToAccessories() {
    await this.accessoriesLink.click();
  }

  async goToGroceries() {
    await this.groceriesLink.click();
  }

  async goToLogin() {
    await this.loginLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}

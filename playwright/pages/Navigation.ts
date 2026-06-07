import { expect, Locator, Page } from "@playwright/test";
import { SearchPage } from "./SearchPage";
import { LoginPage } from "./LoginPage";
import { Cart } from "./Cart";

export type NavigationOptions = "home" | "all" | "apparel" | "accessories" | "groceries" | "login" | "cart";

export class Navigation {
  private readonly page: Page;
  readonly cart: Cart;
  readonly container: Locator;
  readonly homeLink: Locator;
  readonly allLink: Locator;
  readonly apparelLink: Locator;
  readonly accessoriesLink: Locator;
  readonly groceriesLink: Locator;
  readonly loginLink: Locator;
  readonly userButton: Locator;
  readonly cartLink: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cart = new Cart(this.page);
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
    this.userButton = this.container.getByRole("button", { name: /Open user menu/ });
    this.cartLink = this.container.getByTestId("CartNavItem");
    this.searchInput = this.container.getByPlaceholder("Search for products...");
  }

  async goto(option: NavigationOptions) {
    switch (option) {
      case "home":
        await expect(this.homeLink).toBeVisible();
        await this.homeLink.click();
        break;
      case "all":
        await expect(this.allLink).toBeVisible();
        await this.allLink.click();
        break;
      case "apparel":
        await expect(this.apparelLink).toBeVisible();
        await this.apparelLink.click();
        break;
      case "accessories":
        await expect(this.accessoriesLink).toBeVisible();
        await this.accessoriesLink.click();
        break;
      case "groceries":
        await expect(this.groceriesLink).toBeVisible();
        await this.groceriesLink.click();
        break;
      case "login":
        await expect(this.loginLink).toBeVisible();
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
    return new LoginPage(this.page);
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    return new SearchPage(this.page);
  }
}

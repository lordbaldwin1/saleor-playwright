import { expect, Locator, Page } from "@playwright/test";
import { SearchPage } from "./SearchPage";
import { LoginPage } from "./LoginPage";
import { Cart } from "./Cart";
import { BasePage } from "./BasePage";

export type NavigationOptions =
  | "home"
  | "all"
  | "apparel"
  | "accessories"
  | "groceries"
  | "login"
  | "cart";

export class Navigation extends BasePage {
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
  readonly mobileMenuButton: Locator;
  readonly mobileMenuDialog: Locator;
  readonly mobileHomeLink: Locator;
  readonly mobileSearchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.cart = new Cart(this.page);
    this.container = this.page.locator("header");
    this.mobileMenuDialog = this.page.getByRole("dialog", {
      name: "Navigation menu",
    });
    this.homeLink = this.container.getByLabel("Homepage");
    this.allLink = this.page.getByRole("link", { name: "All" });
    this.apparelLink = this.page.getByRole("link", { name: "Apparel" });
    this.accessoriesLink = this.page.getByRole("link", {
      name: "Accessories",
    });
    this.groceriesLink = this.page.getByRole("link", {
      name: "Groceries",
    });
    this.loginLink = this.page.getByRole("link", { name: "Log in" });
    this.userButton = this.page.getByRole("button", { name: /Open user menu/ });
    this.cartLink = this.page.getByTestId("CartNavItem");
    this.searchInput = this.page.getByPlaceholder("Search for products...");
    this.mobileMenuButton = this.page.getByRole("button", {
      name: "Open menu",
    });
    this.mobileHomeLink = this.mobileMenuDialog.getByLabel("Homepage");
    this.mobileSearchInput = this.mobileMenuDialog.getByPlaceholder(
      "Search for products...",
    );
  }

  async goto(option: NavigationOptions) {
    switch (option) {
      case "home":
        await this.goToHome();
        break;
      case "all":
        await this.goToAll();
        break;
      case "apparel":
        await this.goToApparel();
        break;
      case "accessories":
        await this.goToAccessories();
        break;
      case "groceries":
        await this.goToGroceries();
        break;
      case "login":
        await this.goToLogin();
        break;
      default:
        throw new Error(`Invalid navigation option: ${option}`);
    }
  }

  async openMobileMenu() {
    await expect(this.mobileMenuButton).toBeEnabled();
    await this.mobileMenuButton.click();
    await expect(this.mobileMenuDialog).toBeVisible();
  }

  async goToHome() {
    if (await this.isMobile()) {
      await this.openMobileMenu();
      await expect(this.mobileHomeLink).toBeVisible();
      await this.mobileHomeLink.click();
      return;
    }
    await expect(this.homeLink).toBeVisible();
    await this.homeLink.click();
  }

  async goToAll() {
    if (await this.isMobile()) {
      await this.openMobileMenu();
    }
    await expect(this.allLink).toBeVisible();
    await this.allLink.click();
  }

  async goToApparel() {
    if (await this.isMobile()) {
      await this.openMobileMenu();
    }
    await expect(this.apparelLink).toBeVisible();
    await this.apparelLink.click();
  }

  async goToAccessories() {
    if (await this.isMobile()) {
      await this.openMobileMenu();
    }
    await expect(this.accessoriesLink).toBeVisible();
    await this.accessoriesLink.click();
  }

  async goToGroceries() {
    if (await this.isMobile()) {
      await this.openMobileMenu();
    }
    await expect(this.groceriesLink).toBeVisible();
    await this.groceriesLink.click();
  }

  async goToLogin() {
    await expect(this.loginLink).toBeVisible();
    await this.loginLink.click();
    return new LoginPage(this.page);
  }

  async goToCart() {
    await expect(this.cartLink).toBeVisible();
    await this.cartLink.click();
  }

  async search(query: string) {
    if (await this.isMobile()) {
      await this.openMobileMenu();
      await expect(this.mobileSearchInput).toBeVisible();
      await this.mobileSearchInput.fill(query);
      await this.mobileSearchInput.press("Enter");
      return new SearchPage(this.page);
    }
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    return new SearchPage(this.page);
  }
}

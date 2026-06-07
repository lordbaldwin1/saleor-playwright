import { Locator, Page } from "@playwright/test";
import { Navigation } from "./Navigation";
import { BasePage } from "./BasePage";

export class SearchPage extends BasePage {
  readonly navigation: Navigation;
  readonly resultsText: Locator;
  readonly searchResults: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new Navigation(this.page);
    this.resultsText = this.page.getByText(/Results for/);
    this.searchResults = this.page.locator(".grid.grid-cols-1.gap-8 > li");
  }

  async findProductInResults(productName: string) {
    for (const result of await this.searchResults.all()) {
      const name = result.getByRole("heading", { level: 3 });
      if (await name.textContent() === productName) {
        return result;
      }
    }
    throw new Error(`Product "${productName}" not found`);
  }
}

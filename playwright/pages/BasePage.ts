import { Page } from "@playwright/test";
import { isMobile } from "../helpers/helpers";


export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async isMobile() {
    return await isMobile(this.page);
  }
}
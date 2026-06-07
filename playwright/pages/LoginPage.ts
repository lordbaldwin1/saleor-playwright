import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator; 
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.getByLabel("Email address");
    this.passwordInput = this.page.getByLabel("Password");
    this.signInButton = this.page.getByRole("button", { name: "Sign in" });
    this.errorMessage = this.page.getByText("Invalid email or password");
  }

  async goto() {
    await this.page.goto("default-channel/login");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }
}
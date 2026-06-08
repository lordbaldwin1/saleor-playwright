import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HomePage } from "./HomePage";


export class LoginPage extends BasePage {
  readonly header: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator; 
  readonly errorMessage: Locator;
  readonly rateLimitError: Locator;

  constructor(page: Page) {
    super(page);
    this.header = this.page.getByRole("heading", { name: "Welcome Back" });
    this.emailInput = this.page.getByPlaceholder("you@example.com");
    this.passwordInput = this.page.getByPlaceholder("Enter your password");
    this.signInButton = this.page.getByRole("button", { name: "Sign in" });
    this.errorMessage = this.page.getByText("Invalid email or password");
    this.rateLimitError = this.page.getByText("Logging has been suspended");
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

  async fillForm(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  async clickSignIn() {
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.fillForm(email, password);
    await this.clickSignIn();
    return new HomePage(this.page);
  }
}
import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { LoginPage } from "./LoginPage";


export class SignupPage extends BasePage {
  readonly header: Locator;
  readonly signInLink: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly confirmPasswordInput: Locator;
  readonly passwordMismatchError: Locator;
  readonly signUpButton: Locator;
  readonly disclaimer: Locator;

  // success screen
  readonly successMessage: Locator;
  readonly goToSignInLink: Locator;

  constructor(page: Page) {
    super(page);
    this.header = this.page.getByRole("heading", { name: "Create an Account" });
    this.signInLink = this.page.getByRole("link", { name: "Sign in" });
    this.firstNameInput = this.page.getByLabel("First name");
    this.lastNameInput = this.page.getByLabel("Last name");
    this.emailInput = this.page.getByLabel("Email address");
    this.passwordInput = this.page.getByPlaceholder("Minimum 8 characters…");
    this.showPasswordButton = this.page.getByRole("button", { name: "Show password" });
    this.confirmPasswordInput = this.page.getByPlaceholder("Re-enter your password");
    this.passwordMismatchError = this.page.getByText("Passwords do not match");
    this.signUpButton = this.page.getByRole("button", { name: "Create Account" });
    this.disclaimer = this.page.getByText(/By creating an account/);

    // success screen
    this.successMessage = this.page.getByRole("heading", { name: "Account created!" });
    this.goToSignInLink = this.page.getByRole("link", { name: "Go to Sign In" });
  }

  async goto() {
    await this.page.goto("default-channel/signup");
  }

  async fillForm(firstName: string, lastName: string, email: string, password: string, confirmPassword: string) {
    await expect(this.firstNameInput).toBeEditable();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async formClickSignUp() {
    await this.signUpButton.click();
  }

  async signup(firstName: string, lastName: string, email: string, password: string, confirmPassword: string) {
    await this.fillForm(firstName, lastName, email, password, confirmPassword);
    await this.formClickSignUp();
  }

  async successGoToSignIn() {
    await expect(this.successMessage).toBeVisible();
    await this.goToSignInLink.click();
    return new LoginPage(this.page);
  }
}
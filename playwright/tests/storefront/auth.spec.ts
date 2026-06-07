import { test, expect } from "../../fixtures";
import { apiCreateCustomer, apiLoginBrowser } from "../../helpers/auth";

test.describe("Auth", () => {
  test("should login", async ({ request, page }) => {
    const email = "test@example.com";
    const password = "password";

    await apiCreateCustomer(request, email, password);
    await apiLoginBrowser(page, email, password);

    await page.goto("default-channel");
    await expect(page.getByRole("button", { name: /Open user menu/ })).toBeVisible();
  });
});
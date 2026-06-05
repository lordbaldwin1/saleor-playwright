import { expect, test as setup } from "@playwright/test";
import { apiCreateCustomer, apiLoginBrowser } from "../../helpers/auth";
import path from "path";

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup("global auth setup", async ({ request, page }) => {
  const email = "test@example.com";
  const password = "password";

  const response = await apiCreateCustomer(request, email, password);
  expect(response.errors).toBeUndefined();

  await apiLoginBrowser(page, email, password);
  await page.context().storageState({ path: authFile });
});
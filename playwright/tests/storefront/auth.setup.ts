import { test as setup } from "@playwright/test";
import {
  apiCreateCustomer,
  apiLoginBrowser,
  apiLoginRequest,
} from "../../helpers/auth";
import { config } from "../../config";

const authFile = config.storefrontCustomerAuthFile;

setup("global auth setup", async ({ request, page }) => {
  const email = config.globalCustomerEmail;
  const password = config.customerPassword;

  await apiCreateCustomer(request, email, password);
  await apiLoginBrowser(page, email, password);
  await page.context().storageState({ path: authFile });
});

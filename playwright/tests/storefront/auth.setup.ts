import { test as setup } from "@playwright/test";
import { AuthApi } from "../../api-client/AuthApi";
import { GqlClient } from "../../api-client/GqlClient";
import { apiLoginBrowser } from "../../helpers/auth";
import { testData } from "../../helpers/test-data";
import { saveTestVoucher } from "../../helpers/voucher-setup";
import { config } from "../../config";

const authFile = config.storefrontCustomerAuthFile;

setup("global auth setup", async ({ request, page }) => {
  const email = config.globalCustomerEmail;
  const password = config.customerPassword;

  const authApi = new AuthApi(new GqlClient(request));
  await authApi.createCustomer(email, password);
  await apiLoginBrowser(page, email, password);
  await page.context().storageState({ path: authFile });
  await saveTestVoucher({
    code: `PW-${Date.now()}`,
    discountValue: testData.voucherCode.discountValue,
  });
});

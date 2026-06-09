import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductsPage } from "../pages/ProductsPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import {
  LoginData,
  testData,
  type CheckoutData,
  type SignupData,
  type TestProduct,
} from "../helpers/test-data";
import { AuthApi } from "../api-client/AuthApi";
import { GqlClient } from "../api-client/GqlClient";
import { VoucherApi } from "../api-client/VoucherApi";
import { config } from "../config";
import { apiLoginRequestContext } from "../helpers/auth";
import { SignupPage } from "../pages/SignupPage";
import { LoginPage } from "../pages/LoginPage";

type Fixtures = {
  // e2e fixtures
  homePage: HomePage;
  signupPage: SignupPage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
  testData: typeof testData;
  testProduct: TestProduct;
  multiVariantTestProduct: TestProduct;
  guestCheckout: CheckoutData;
  guestCheckoutNonDefaultShippingMethod: CheckoutData;
  signupTestData: SignupData;
  loginTestData: LoginData;
  // api fixtures
  authenticatedRequest: APIRequestContext;
  voucherCode: { code: string; discountValue: number };
  uniqueCustomer: LoginData;
};

type WorkerFixtures = {
  workerStorageState: string;
};

const test = base.extend<Fixtures, WorkerFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  testData: async ({}, use) => {
    await use(testData);
  },
  testProduct: async ({ testData }, use) => {
    await use(testData.testProduct);
  },
  multiVariantTestProduct: async ({ testData }, use) => {
    await use(testData.multiVariantTestProduct);
  },
  guestCheckout: async ({ testData }, use) => {
    await use(testData.guestCheckout);
  },
  guestCheckoutNonDefaultShippingMethod: async ({ testData }, use) => {
    await use(testData.guestCheckoutNonDefaultShippingMethod);
  },
  signupTestData: async ({ testData }, use) => {
    await use(testData.signup);
  },
  loginTestData: async ({ testData }, use) => {
    await use(testData.login);
  },

  // api fixtures
  authenticatedRequest: async ({ request }, use) => {
    const authenticatedRequest = await apiLoginRequestContext(
      request,
      config.adminEmail,
      config.adminPassword,
    );
    await use(authenticatedRequest);
    await authenticatedRequest.dispose();
  },
  uniqueCustomer: async ({ request, loginTestData }, use) => {
    const authApi = new AuthApi(new GqlClient(request));
    await authApi.createCustomer(loginTestData.email, loginTestData.password);
    await use(loginTestData);
  },
  voucherCode: async ({ authenticatedRequest, testData }, use) => {
    const voucherApi = new VoucherApi(new GqlClient(authenticatedRequest));
    const voucher = await voucherApi.createFixedOrderVoucher(
      testData.voucherCode,
    );
    await use(voucher);
  },
});

export { test, expect };

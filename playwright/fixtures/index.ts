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
import { config } from "../config";
import { apiCreateCustomer, apiLoginRequest } from "../helpers/auth";
import { gql } from "../helpers/graphql";
import { SignupPage } from "../pages/SignupPage";
import { LoginPage } from "../pages/LoginPage";
// import path from "path";
// import fs from "fs";
// import { apiCreateCustomer, apiLoginBrowser } from "../helpers/auth";
// import { config } from "../config";

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
    const authenticatedRequest = await apiLoginRequest(
      request,
      config.adminEmail,
      config.adminPassword,
    );
    await use(authenticatedRequest);
    await authenticatedRequest.dispose();
  },
  uniqueCustomer: async ({ authenticatedRequest, loginTestData }, use) => {
    await apiCreateCustomer(authenticatedRequest, loginTestData.email, loginTestData.password);
    await use(loginTestData);
  },
  voucherCode: async ({ authenticatedRequest, testData }, use) => {
    const { code, discountValue } = testData.voucherCode;
    const { voucherCreate } = await gql<{
      voucherCreate: {
        voucher: { id: string; code: string };
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>(
      authenticatedRequest,
      `
          mutation VoucherCreate($input: VoucherInput!) {
            voucherCreate(input: $input) {
              voucher {
                id
                code
              }
              errors {
                field
                message
                code
              }
            }
          }
      `,
      {
        input: {
          name: "Playwright APIRequestContext Voucher",
          addCodes: [code],
          type: "ENTIRE_ORDER",
          discountValueType: "FIXED",
          applyOncePerOrder: true,
          singleUse: true,
        },
      },
    );

    if (voucherCreate.errors.length > 0) {
      throw new Error(
        voucherCreate.errors
          .map((e) => `${e.field ?? "?"}: ${e.message}`)
          .join("; "),
      );
    }

    const { channels } = await gql<{
      channels: Array<{ id: string; slug: string }>;
    }>(authenticatedRequest, `query Channels { channels { id slug } }`);

    const channel = channels.find((c) => c.slug === config.defaultChannel);
    if (!channel) {
      throw new Error(`Channel not found: ${config.defaultChannel}`);
    }

    const { voucherChannelListingUpdate } = await gql<{
      voucherChannelListingUpdate: {
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>(
      authenticatedRequest,
      `
          mutation VoucherChannelListingUpdate(
            $id: ID!
            $input: VoucherChannelListingInput!
          ) {
            voucherChannelListingUpdate(id: $id, input: $input) {
              errors {
                field
                message
                code
              }
            }
          }
      `,
      {
        id: voucherCreate.voucher.id,
        input: {
          addChannels: [{ channelId: channel.id, discountValue }],
        },
      },
    );

    if (voucherChannelListingUpdate.errors.length > 0) {
      throw new Error(
        voucherChannelListingUpdate.errors
          .map((e) => `${e.field ?? "?"}: ${e.message}`)
          .join("; "),
      );
    }

    await use({ code, discountValue });
  },
});

export { test, expect };

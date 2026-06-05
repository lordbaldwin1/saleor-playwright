import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductsPage } from "../pages/ProductsPage";
import { testData, TestProduct } from "../helpers/test-data";
import path from "path";
import fs from "fs";
import { apiCreateCustomer, apiLoginBrowser } from "../helpers/auth";
import { config } from "../config";

type Fixtures = {
  // e2e fixtures
  homePage: HomePage;
  productsPage: ProductsPage;
  testData: typeof testData;
  testProduct: TestProduct;
  multiVariantTestProduct: TestProduct;
  // api fixtures
};

type WorkerFixtures = {
  workerStorageState: string;
};

const test = base.extend<Fixtures, WorkerFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
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

  storageState: async ({ workerStorageState }, use) => await use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const authDir = path.resolve(config.authDir);
      const fileName = path.join(authDir, `storage-${id}.json`);

      fs.mkdirSync(authDir, { recursive: true });

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      const page = await browser.newPage({ storageState: undefined });
      const email = `worker-${id}@example.com`;
      const password = "password";

      await apiCreateCustomer(page.request, email, password);
      await apiLoginBrowser(page, email, password);
      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});

export { test, expect };

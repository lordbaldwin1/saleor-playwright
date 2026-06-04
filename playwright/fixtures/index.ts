import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage"
import { ProductsPage } from "../pages/ProductsPage";
import { testData } from "../helpers/test-data";


type Fixtures = {
  homePage: HomePage;
  productsPage: ProductsPage;
  testData: typeof testData;
  allProductName: string;
};

const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  testData: async ({}, use) => {
    await use(testData);
  },
  allProductName: async ({ testData }, use) => {
    await use(testData.allProduct);
  },
}); 

export { test, expect };


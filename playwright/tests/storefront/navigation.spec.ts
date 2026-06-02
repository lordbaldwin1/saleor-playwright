import { test, expect } from "../../fixtures";
import { NavigationOptions } from "../../pages/Navigation";

type NavigationTestCase = {
  option: NavigationOptions;
  expectedUrl: string;
};

const navigationTestCases: NavigationTestCase[] = [
  {
    option: "home",
    expectedUrl: "/default-channel",
  },
  {
    option: "all",
    expectedUrl: "/default-channel/products",
  },
  {
    option: "apparel",
    expectedUrl: "/default-channel/categories/apparel",
  },
  {
    option: "accessories",
    expectedUrl: "/default-channel/categories/accessories",
  },
  {
    option: "groceries",
    expectedUrl: "/default-channel/categories/groceries",
  },
  {
    option: "login",
    expectedUrl: "/default-channel/login",
  },
];

test.describe("Navigation", () => {
  navigationTestCases.forEach((testCase) => {
    test(`Navigation to ${testCase.option}`, async ({ homePage, page }) => {
      await homePage.goto();
      await homePage.navigation.goto(testCase.option);
      await expect(page).toHaveURL(testCase.expectedUrl);
    });
  });
});

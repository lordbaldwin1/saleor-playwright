import { test, expect } from "../../fixtures";
import { navigationTestCases } from "../../helpers/test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Navigation", () => {
  navigationTestCases.forEach((testCase) => {
    test(`Navigation to ${testCase.option}`, async ({ homePage, page }) => {
      await homePage.goto();
      await expect(homePage.navigation.container).toBeVisible();

      await homePage.navigation.goto(testCase.option);
      await expect(page).toHaveURL(testCase.expectedUrl);
    });
  });
});

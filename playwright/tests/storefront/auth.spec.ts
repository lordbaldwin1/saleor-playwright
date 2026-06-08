import { test, expect } from "../../fixtures";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Auth", () => {
  test.describe.configure({ mode: "serial" });

  // rate limit causes this to fail, skipping for now
  // test.skip("should signup and land on login page", async ({
  //   signupPage,
  //   signupTestData,
  // }) => {
  //   await signupPage.goto();
  //   await signupPage.signup(
  //     signupTestData.firstName,
  //     signupTestData.lastName,
  //     signupTestData.email,
  //     signupTestData.password,
  //     signupTestData.password,
  //   );
  //   await expect(signupPage.successMessage).toBeVisible();
  //   const loginPage = await signupPage.successGoToSignIn();
  //   await expect(loginPage.header).toBeVisible();
  // });

  test("error message displayed when passwords do not match", async ({
    signupPage,
    signupTestData,
  }) => {
    await signupPage.goto();
    await signupPage.fillForm(
      signupTestData.firstName,
      signupTestData.lastName,
      signupTestData.email,
      signupTestData.password,
      signupTestData.password + "1234",
    );
    await expect(signupPage.passwordMismatchError).toBeVisible();
  });

  test("should login user and land on home page", async ({
    loginPage,
    uniqueCustomer,
  }) => {
    await loginPage.goto();
    const homePage = await loginPage.login(
      uniqueCustomer.email,
      uniqueCustomer.password,
    );
    await expect(homePage.navigation.userButton).toBeVisible();
  });
});

import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { config } from "./playwright/config";

const repoRoot = __dirname;

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    testIdAttribute: "data-testid",
  },
  projects: [
    // {
    //   name: "storefront-setup",
    //   testDir: "./playwright/tests/storefront",
    //   testMatch: /auth\.setup\.ts/,
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     baseURL: config.storefrontUrl,
    //   },
    // },
    {
      name: "storefront",
      testDir: "./playwright/tests/storefront",
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: config.storefrontUrl,
      },
      // dependencies: ['storefront-setup'],
    },
    {
      name: "dashboard",
      testDir: "./playwright/tests/dashboard",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: config.dashboardUrl,
      },
    },
    {
      name: "api",
      testDir: "./playwright/tests/api",
      use: {
        baseURL: config.apiUrl,
        extraHTTPHeaders: {
          "Content-Type": "application/json",
        },
      },
    },
  ],
  ...(config.startServers
    ? {
        webServer: [
          {
            command: "npm run saleor:up:detached",
            url: config.apiHealthUrl,
            cwd: repoRoot,
            timeout: 300_000,
            reuseExistingServer: !process.env.CI,
          },
          {
            command: "bash scripts/payment-app-bootstrap.sh",
            url: `${config.dummyPaymentAppUrl}/api/manifest`,
            cwd: repoRoot,
            timeout: 300_000,
            reuseExistingServer: !process.env.CI,
          },
          {
            command: "npm run storefront:dev",
            url: config.storefrontUrl,
            cwd: repoRoot,
            timeout: 300_000,
            reuseExistingServer: !process.env.CI,
          },
        ],
      }
    : {}),
});

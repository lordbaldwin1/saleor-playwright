import { test, expect } from "@playwright/test";

/**
 * API / GraphQL smoke test — replace or extend with your own specs.
 * Uses Playwright's APIRequestContext (no browser).
 */
test.describe("Saleor GraphQL API", () => {
  test("responds to introspection query", async ({ request }) => {
    const response = await request.post("", {
      data: {
        query: `{ __typename }`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.__typename).toBe("Query");
  });
});

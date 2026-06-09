import { test, expect } from "@playwright/test";
import { ProductsApi } from "../../api-client/ProductsApi";
import { GqlClient } from "../../api-client/GqlClient";

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

  test("5 products in price range", async ({ request }) => {
    const api = new ProductsApi(new GqlClient(request));
    const data = await api.getProductsInPriceRange(50, 100, 5) as any;
    expect(data.products.totalCount).toBe(5);
    for (const { node } of data.products.edges) {
      expect(node).toHaveProperty("id");
      expect(node).toHaveProperty("name");
      expect(node).toHaveProperty("category")
      expect(node.category).toHaveProperty("name");
    }
  });
});

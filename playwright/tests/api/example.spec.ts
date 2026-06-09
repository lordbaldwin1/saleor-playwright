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
    const data = await api.getProductsInPriceRange(10, 100, 5);
    expect(data.products.totalCount).toBe(22);
    expect(data.products.edges.length).toBeLessThanOrEqual(10);
    for (const { node } of data.products.edges) {
      expect(node).toHaveProperty("id");
      expect(node).toHaveProperty("name");
      expect(node).toHaveProperty("category")
      expect(node.category).toHaveProperty("name");
    }
  });

  test("single product detail and availability", async ({ request }) => {
    const api = new ProductsApi(new GqlClient(request));
    const { products: { edges } } = await api.getProductsInPriceRange(undefined, undefined, 1);
    expect(edges.length).toBeGreaterThan(0);
    const productId = edges[0].node.id;

    const { products } = await api.getSingleProduct(productId);
    expect(products).toHaveProperty("edges");
    expect(products.edges.length).toBeGreaterThan(0);
    expect(products.edges[0]).toHaveProperty("node");

    const { node: productNode } = products.edges[0];
    expect(productNode).toHaveProperty("productVariants");
    expect(productNode).toHaveProperty("isAvailable");
    expect(productNode).toHaveProperty("media");
    expect(productNode.isAvailable).toBe(true);
    expect(productNode.media[0]).toHaveProperty("url");
    expect(productNode.media[0]).toHaveProperty("alt");
    expect(productNode.productVariants.edges.length).toBeGreaterThan(0);

    const { node: productVariantNode } = productNode.productVariants.edges[0];
    expect(productVariantNode).toHaveProperty("id");
    expect(productVariantNode).toHaveProperty("name");
  });

  test("3-step authentication flow", async ({ request }) => {

  });
});

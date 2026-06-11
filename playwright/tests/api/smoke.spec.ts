import { test, expect } from "@playwright/test";
import { ProductsApi } from "../../api-client/ProductsApi";
import { GqlClient } from "../../api-client/GqlClient";
import { config } from "../../config";
import { AuthApi } from "../../api-client/AuthApi";

test.describe("API cmoke tests", () => {
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
      expect(node).toHaveProperty("category");
      expect(node.category).toHaveProperty("name");
    }
  });

  test("single product detail and availability", async ({ request }) => {
    const api = new ProductsApi(new GqlClient(request));
    const {
      products: { edges },
    } = await api.getProductsInPriceRange(undefined, undefined, 1);
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
    console.log(productVariantNode.id);
    expect(productVariantNode).toHaveProperty("name");
  });

  test("3-step authentication flow smoke test", async ({ request }) => {
    const api = new AuthApi(new GqlClient(request));
    const email = `user-${Math.random() * 10000}@example.com`;
    const password = config.customerPassword;

    const { requiresConfirmation, errors: createCustomerErrors } =
      await api.createCustomer(email, password);
    expect(requiresConfirmation).toBe(false);
    expect(
      createCustomerErrors,
      formatAccountErrors(createCustomerErrors),
    ).toHaveLength(0);

    const {
      token,
      refreshToken,
      csrfToken,
      errors: createTokenErrors,
    } = await api.createToken(email, password);
    expect(token).not.toBeNull();
    expect(refreshToken).not.toBeNull();
    expect(csrfToken).not.toBeNull();
    expect(
      createTokenErrors,
      formatAccountErrors(createTokenErrors),
    ).toHaveLength(0);

    const { isValid, errors: tokenVerifyErrors } = await api.tokenVerify(
      token!,
    );
    expect(isValid).toBe(true);
    expect(
      tokenVerifyErrors,
      formatAccountErrors(tokenVerifyErrors),
    ).toHaveLength(0);

    const me = await api.me(token!);
    expect(me).not.toBeNull();
    expect(me!.email).toBe(email);
  });
});

type AccountErrors = {
  field: string;
  message: string;
  code: string;
};

function formatAccountErrors(errors: AccountErrors[]) {
  return `${errors.map((e) => `${e.field}: ${e.message}, ${e.code}`).join(";\n")}`;
}

import { GqlClient } from "./GqlClient";

export class ProductsApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async getProductsInPriceRange(low: number, high: number, first: number) {
    const query = `
      query GetProductsInPriceRange(
        $first: Int!
        $channel: String!
        $where: ProductWhereInput!
        ) {
        products(
          first: $first
          channel: $channel
          where: $where
        ) {
          totalCount
          edges {
            node {
              id
              name
              category {
                name
              }
            }
          }
        }
      }`;

    const data = await this.gqlClient.query(query, {
      first,
      channel: "default-channel",
      where: {
        minimalPrice: {
          range: {
            gte: low,
            lte: high,
          },
        },
      },
    });
    return data;
  }
}

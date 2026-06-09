import { GqlClient } from "./GqlClient";

export class ProductsApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async getSingleProduct(productId: string) {
    const query = `query GetSingleProduct(
        $where: ProductWhereInput!, 
        $channel: String!, 
        $address: AddressInput!, 
        $first: Int!
      ) {
        products(where: $where, channel: $channel, first: $first) {
          edges {
            node {
              productVariants(first: $first) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              isAvailable(address: $address)
              media {
                url
                alt
              }
            }
          }
        }
      }`;
    const variables = {
      where: { ids: productId },
      channel: "default-channel",
      address: { country: "US" },
      first: 100,
    };

    const data = await this.gqlClient.query<{
      products: {
        edges: {
          node: {
            productVariants: {
              edges: {
                node: {
                  id: string;
                  name: string;
                };
              }[];
            };
            isAvailable: true;
            media: {
              url: string;
              alt: string;
            }[];
          };
        }[];
      };
    }>(query, variables);
    return data;
  }

  async getProductsInPriceRange(
    low?: number,
    high?: number,
    first: number = 10,
  ) {
    const where =
      low && high
        ? {
            minimalPrice: {
              range: {
                gte: low,
                lte: high,
              },
            },
          }
        : null;
    const variables = {
      first,
      channel: "default-channel",
      where: where ?? null,
    };
    const query = `
      query GetProductsInPriceRange(
        $first: Int!
        $channel: String!
        $where: ProductWhereInput
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

    const data = await this.gqlClient.query<{
      products: {
        totalCount: number;
        edges: {
          node: {
            id: string;
            name: string;
            category: {
              name: string;
            };
          };
        }[];
      };
    }>(query, variables);
    return data;
  }
}

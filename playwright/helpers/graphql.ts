import type { APIRequestContext } from "@playwright/test";

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

/** POST a GraphQL operation to the configured API baseURL. */
export async function gql<T>(
  request: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLResponse<T>> {
  const response = await request.post("", {
    data: { query, variables },
  });
  return response.json() as Promise<GraphQLResponse<T>>;
}

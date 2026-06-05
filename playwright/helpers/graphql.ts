import type { APIRequestContext } from "@playwright/test";
import { config } from "../config";

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
  const response = await request.post(config.apiUrl, {
    data: { query, variables },
  });
  return response.json() as Promise<GraphQLResponse<T>>;
}

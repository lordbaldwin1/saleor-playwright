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
): Promise<T> {
  const response = await request.post(config.apiUrl, {
    data: { query, variables },
  });
  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (!body.data) {
    throw new Error("GraphQL response missing data");
  }
  return body.data;
}

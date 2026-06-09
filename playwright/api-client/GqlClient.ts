import { APIRequestContext, expect } from "@playwright/test";
import { config } from "../config";

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export class GqlClient {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.request.post(config.apiUrl, {
      data: { query, variables },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as GraphQLResponse<T>;
    if (body.errors) {
      throw new Error(body.errors.map((e) => e.message).join("; "));
    }
    if (!body.data) {
      throw new Error("GraphQL response missing data");
    }
    return body.data;
  }

  async mutation<T>(
    mutation: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    return this.query<T>(mutation, variables);
  }
}

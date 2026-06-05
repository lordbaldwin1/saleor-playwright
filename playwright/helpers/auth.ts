import type { APIRequestContext, Page } from "@playwright/test";
import { config } from "../config";
import type { GraphQLResponse } from "./graphql";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

/** Matches storefront encodeCookieName in src/lib/auth/constants.ts */
function encodeCookieName(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function storefrontAuthCookieName(suffix: string): string {
  return encodeCookieName([config.apiUrl, suffix].join("+"));
}

export async function setStorefrontAuthCookies(
  page: Page,
  accessToken: string,
  refreshToken: string,
) {
  const { hostname } = new URL(config.storefrontUrl);
  await page.context().addCookies([
    {
      name: storefrontAuthCookieName("saleor_auth_access_token"),
      value: accessToken,
      domain: hostname,
      path: "/",
      expires: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_MAX_AGE,
      sameSite: "Lax",
    },
    {
      name: storefrontAuthCookieName("saleor_auth_module_refresh_token"),
      value: refreshToken,
      domain: hostname,
      path: "/",
      expires: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_MAX_AGE,
      sameSite: "Lax",
    },
  ]);
}

export async function apiCreateCustomer(request: APIRequestContext, email: string, password: string) {
  const redirectUrl = config.storefrontUrl;
  const channel = config.defaultChannel;

  const response = await request.post(config.apiUrl, {
    data: {
      query: `
        mutation RegisterAccount($email: String!, $password: String!, $redirectUrl: String, $channel: String) {
          accountRegister(input: {email: $email, password: $password, redirectUrl: $redirectUrl, channel: $channel}) {
            errors {
              field
              message
            }
            requiresConfirmation
          }
        }
      `,
      variables: { email, password, redirectUrl, channel },
    },
  });
  return response.json() as Promise<GraphQLResponse<{ createCustomer: { customer: { id: string } } }>>;
}

export async function apiCreateToken(request: APIRequestContext, email: string, password: string) {
  const query = `
    mutation TokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
        refreshToken
        errors {
          field
          message
          code
        }
      }
    }
  `;
  const response = await request.post(config.apiUrl, {
    data: {
      query,
      variables: { email, password },
    },
  });
  return response.json() as Promise<
    GraphQLResponse<{
      tokenCreate: {
        token: string;
        refreshToken: string;
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>
  >;
}

export async function apiLoginBrowser(page: Page, email: string, password: string) {
  console.log("logging in", { email, password });
  const response = await apiCreateToken(page.request, email, password);
  const tokenCreate = response.data?.tokenCreate;
  await setStorefrontAuthCookies(page, tokenCreate!.token, tokenCreate!.refreshToken);
}

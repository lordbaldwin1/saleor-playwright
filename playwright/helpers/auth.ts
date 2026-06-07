import type { APIRequestContext, Page } from "@playwright/test";
import { config } from "../config";
import { gql } from "./graphql";

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

export async function apiCreateCustomer(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const redirectUrl = config.storefrontUrl;
  const channel = config.defaultChannel;
  const query = `
    mutation RegisterAccount($email: String!, $password: String!, $redirectUrl: String, $channel: String) {
      accountRegister(input: {email: $email, password: $password, redirectUrl: $redirectUrl, channel: $channel}) {
        errors {
          field
          message
        }
        requiresConfirmation
      }
    }
  `;
  const { accountRegister } = await gql<{
    accountRegister: {
      requiresConfirmation: boolean;
      errors: Array<{ field: string; message: string }>;
    };
  }>(request, query, { email, password, redirectUrl, channel });

  if (accountRegister.errors.length > 0) {
    throw new Error(
      accountRegister.errors
        .map((e) => `${e.field ?? "?"}: ${e.message}`)
        .join("; "),
    );
  }

  if (accountRegister.requiresConfirmation) {
    throw new Error("Account requires confirmation");
  }

  return;
}

export async function apiCreateToken(
  request: APIRequestContext,
  email: string,
  password: string,
) {
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

  const { tokenCreate } = await gql<{
    tokenCreate: {
      token: string;
      refreshToken: string;
      errors: Array<{ field: string; message: string; code: string }>;
    };
  }>(request, query, { email, password });

  if (tokenCreate.errors.length > 0) {
    throw new Error(
      tokenCreate.errors
        .map((e) => `${e.field ?? "?"}: ${e.message}`)
        .join("; "),
    );
  }

  return tokenCreate;
}

export async function apiLoginBrowser(
  page: Page,
  email: string,
  password: string,
) {
  const { token, refreshToken } = await apiCreateToken(
    page.request,
    email,
    password,
  );
  await setStorefrontAuthCookies(page, token, refreshToken);
  return;
}

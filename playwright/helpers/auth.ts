import { request, type APIRequestContext, type Page } from "@playwright/test";
import { AuthApi } from "../api-client/AuthApi";
import { GqlClient } from "../api-client/GqlClient";
import { config } from "../config";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

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

export async function apiLoginBrowser(
  page: Page,
  email: string,
  password: string,
) {
  const authApi = new AuthApi(new GqlClient(page.request));
  const { token, refreshToken } = await authApi.createToken(email, password);
  await setStorefrontAuthCookies(page, token, refreshToken);
}

export async function apiLoginRequestContext(
  initialRequest: APIRequestContext,
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const authApi = new AuthApi(new GqlClient(initialRequest));
  const { token } = await authApi.createToken(email, password);
  // initialRequest can't be mutated — create a new context with the token.
  return request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

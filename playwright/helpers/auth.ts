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
  await setStorefrontAuthCookies(page, token!, refreshToken!);
}

async function createToken(
  email: string,
  password: string,
): Promise<string> {
  const cleanRequest = await request.newContext({
    storageState: { cookies: [], origins: [] },
  });
  try {
    const authApi = new AuthApi(new GqlClient(cleanRequest));
    const { token, errors } = await authApi.createToken(email, password);
    if (!token) {
      const message =
        errors?.map((e) => e.message).join("; ") || "no token returned";
      throw new Error(`Failed to authenticate as ${email}: ${message}`);
    }
    return token;
  } finally {
    await cleanRequest.dispose();
  }
}

export async function apiLoginRequestContext(
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const token = await createToken(email, password);
  return request.newContext({
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

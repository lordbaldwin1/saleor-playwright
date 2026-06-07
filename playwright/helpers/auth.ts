import { request, type APIRequestContext, type Page } from "@playwright/test";
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

export async function apiLoginRequest(
  initialRequest: APIRequestContext,
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const { token } = await apiCreateToken(initialRequest, email, password);
  // initialRequest can't be mutated — create a new context with the token.
  const authenticatedRequest = await request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  const code = `PW-${Date.now()}`;
  const { voucherCreate } = await gql<{
      voucherCreate: {
        voucher: { id: string };
        errors: Array<{ field: string; message: string; code: string }>;
      };
  }>(
    authenticatedRequest,
    `
        mutation VoucherCreate($input: VoucherInput!) {
          voucherCreate(input: $input) {
            voucher {
              id
            }
            errors {
              field
              message
              code
            }
          }
        }
    `,
    {
      input: {
        name: "Playwright APIRequestContext Voucher",
        addCodes: [code],
        type: "ENTIRE_ORDER",
        discountValueType: "FIXED",
        applyOncePerOrder: true,
        singleUse: true,
      },
    },
  );

  if (voucherCreate.errors.length > 0) {
    throw new Error(
      voucherCreate.errors
        .map((e) => `${e.field ?? "?"}: ${e.message}`)
        .join("; "),
    );
  }

  const { channels } = await gql<{
    channels: Array<{ id: string; slug: string }>;
  }>(authenticatedRequest, `query Channels { channels { id slug } }`);

  const channel = channels.find((c) => c.slug === config.defaultChannel);
  if (!channel) {
    throw new Error(`Channel not found: ${config.defaultChannel}`);
  }

  const { voucherChannelListingUpdate } = await gql<{
    voucherChannelListingUpdate: {
      errors: Array<{ field: string; message: string; code: string }>;
    };
  }>(
    authenticatedRequest,
    `
        mutation VoucherChannelListingUpdate(
          $id: ID!
          $input: VoucherChannelListingInput!
        ) {
          voucherChannelListingUpdate(id: $id, input: $input) {
            errors {
              field
              message
              code
            }
          }
        }
    `,
    {
      id: voucherCreate.voucher.id,
      input: {
        addChannels: [{ channelId: channel.id, discountValue: 10 }],
      },
    },
  );

  if (voucherChannelListingUpdate.errors.length > 0) {
    throw new Error(
      voucherChannelListingUpdate.errors
        .map((e) => `${e.field ?? "?"}: ${e.message}`)
        .join("; "),
    );
  }

  return authenticatedRequest;
}



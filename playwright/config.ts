function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const defaultChannel = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel";

/** Ensure storefront baseURL ends with `/{channel}/` for Playwright relative navigations. */
function storefrontUrlWithChannel(raw: string, channel: string): string {
  const url = new URL(raw);
  const path = url.pathname.replace(/\/$/, "");
  const channelPath = `/${channel}`;
  if (path === channelPath || path.endsWith(channelPath)) {
    if (!url.pathname.endsWith("/")) {
      url.pathname += "/";
    }
  } else {
    url.pathname = `${path}${channelPath}/`;
  }
  return url.toString();
}

export const config = {
  apiUrl: required("SALEOR_API_URL", "http://localhost:8000/graphql/"),
  apiHealthUrl: required("SALEOR_API_HEALTH_URL", "http://localhost:8000/health/"),
  dashboardUrl: required("SALEOR_DASHBOARD_URL", "http://localhost:9000/"),
  storefrontUrl: storefrontUrlWithChannel(
    required("SALEOR_STOREFRONT_URL", "http://localhost:3000/"),
    defaultChannel,
  ),
  adminEmail: required("SALEOR_ADMIN_EMAIL", "admin@example.com"),
  adminPassword: required("SALEOR_ADMIN_PASSWORD", "admin"),
  defaultChannel,
  dummyPaymentAppPort: Number(process.env.DUMMY_PAYMENT_APP_PORT ?? "3001"),
  dummyPaymentAppUrl:
    process.env.DUMMY_PAYMENT_APP_IFRAME_URL ??
    `http://localhost:${process.env.DUMMY_PAYMENT_APP_PORT ?? "3001"}`,
  authDir: "playwright/.auth",
  storefrontCustomerAuthFile: "playwright/.auth/user.json",
  dashboardAuthFile: "playwright/.auth/dashboard.json",
  startServers: process.env.E2E_START_SERVERS === "1",
  customerPassword: process.env.CUSTOMER_PASSWORD ?? "testpassword",
  globalCustomerEmail: `test-${Date.now() % 1000000}@example.com`,
} as const;

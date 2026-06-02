function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  apiUrl: required("SALEOR_API_URL", "http://localhost:8000/graphql/"),
  apiHealthUrl: required("SALEOR_API_HEALTH_URL", "http://localhost:8000/health/"),
  dashboardUrl: required("SALEOR_DASHBOARD_URL", "http://localhost:9000/"),
  storefrontUrl: required("SALEOR_STOREFRONT_URL", "http://localhost:3000/"),
  adminEmail: required("SALEOR_ADMIN_EMAIL", "admin@example.com"),
  adminPassword: required("SALEOR_ADMIN_PASSWORD", "admin"),
  defaultChannel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel",
  authDir: "playwright/.auth",
  dashboardAuthFile: "playwright/.auth/dashboard.json",
  startServers: process.env.E2E_START_SERVERS === "1",
} as const;

#!/usr/bin/env node
/**
 * Patches a fresh saleor/storefront clone for local API thumbnails (Next.js 16+).
 * Idempotent — safe to run multiple times.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const configPath = join(process.cwd(), "storefront/next.config.js");
let content = readFileSync(configPath, "utf8");

const localIpGuard =
  'dangerouslyAllowLocalIP: process.env.SALEOR_E2E === "1"';
const legacyLocalIpGuard =
  "dangerouslyAllowLocalIP: process.env.NODE_ENV === \"development\"";

if (content.includes(localIpGuard)) {
  console.log("storefront/next.config.js already patched for local images");
  process.exit(0);
}

if (content.includes(legacyLocalIpGuard)) {
  writeFileSync(
    configPath,
    content.replace(legacyLocalIpGuard, localIpGuard),
  );
  console.log(
    "Updated storefront/next.config.js local image patch for production E2E",
  );
  process.exit(0);
}

const needle = "\timages: {\n\t\tremotePatterns: [";
const replacement = `\timages: {
\t\t// Local Saleor API thumbnails (Next.js 16+ blocks localhost by default)
\t\t${localIpGuard},
\t\tremotePatterns: [
\t\t\t{
\t\t\t\tprotocol: "http",
\t\t\t\thostname: "localhost",
\t\t\t\tport: "8000",
\t\t\t\tpathname: "/**",
\t\t\t},
\t\t\t{
\t\t\t\tprotocol: "http",
\t\t\t\thostname: "127.0.0.1",
\t\t\t\tport: "8000",
\t\t\t\tpathname: "/**",
\t\t\t},`;

if (!content.includes(needle)) {
  console.error(
    "Could not patch storefront/next.config.js — upstream format changed. Patch manually or update scripts/patch-storefront-next-config.mjs",
  );
  process.exit(1);
}

writeFileSync(configPath, content.replace(needle, replacement));
console.log("Patched storefront/next.config.js for local Saleor images");

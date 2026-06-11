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

const localPatterns = `\t\t\t{
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

const patches = [
  {
    label: "current upstream (with image formats)",
    needle: "\timages: {\n\t\t// WebP only: AVIF cold-encodes add ~500ms+ to first /_next/image hit on Vercel (hurts LCP).\n\t\tformats: [\"image/webp\"],\n\t\tremotePatterns: [",
    replacement: `\timages: {
\t\t// WebP only: AVIF cold-encodes add ~500ms+ to first /_next/image hit on Vercel (hurts LCP).
\t\tformats: ["image/webp"],
\t\t// Local Saleor API thumbnails (Next.js 16+ blocks localhost by default)
\t\t${localIpGuard},
\t\tremotePatterns: [
${localPatterns}`,
  },
  {
    label: "legacy upstream (remotePatterns only)",
    needle: "\timages: {\n\t\tremotePatterns: [",
    replacement: `\timages: {
\t\t// Local Saleor API thumbnails (Next.js 16+ blocks localhost by default)
\t\t${localIpGuard},
\t\tremotePatterns: [
${localPatterns}`,
  },
];

for (const patch of patches) {
  if (content.includes(patch.needle)) {
    writeFileSync(configPath, content.replace(patch.needle, patch.replacement));
    console.log(
      `Patched storefront/next.config.js for local Saleor images (${patch.label})`,
    );
    process.exit(0);
  }
}

console.error(
  "Could not patch storefront/next.config.js — upstream format changed. Patch manually or update scripts/patch-storefront-next-config.mjs",
);
process.exit(1);

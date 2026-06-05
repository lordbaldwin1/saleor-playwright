#!/usr/bin/env node
/**
 * Patches storefront checkout to use the dummy payment app gateway.
 * Idempotent — safe to run multiple times.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const paymentStepPath = join(
  process.cwd(),
  "storefront/src/checkout/views/saleor-checkout/payment-step.tsx",
);

let content = readFileSync(paymentStepPath, "utf8");

if (content.includes('DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app"')) {
  console.log("storefront payment-step.tsx already patched for dummy payment app");
  process.exit(0);
}

const oldNeedle = `// Dummy payment gateway ID (from Saleor Dummy Payment app)
const dummyGatewayId = "mirumee.payments.dummy";`;

const newNeedle = `// Dummy payment gateway ID (from Saleor Dummy Payment app)
const dummyGatewayId = "saleor.io.dummy-payment-app";`;

if (content.includes(oldNeedle)) {
  content = content.replace(oldNeedle, newNeedle);
  writeFileSync(paymentStepPath, content);
  console.log("Patched storefront payment-step.tsx: mirumee.payments.dummy -> saleor.io.dummy-payment-app");
  process.exit(0);
}

if (content.includes('const dummyGatewayId = "saleor.io.dummy-payment-app"')) {
  console.log("storefront payment-step.tsx already uses saleor.io.dummy-payment-app");
  process.exit(0);
}

console.error(
  "Could not patch storefront payment-step.tsx — upstream format changed. Update scripts/patch-storefront-payment-step.mjs",
);
process.exit(1);

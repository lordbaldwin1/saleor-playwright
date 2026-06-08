#!/usr/bin/env node
/**
 * Patches storefront checkout for E2E: dummy payment app gateway + production build types.
 * Idempotent — safe to run multiple times.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const paymentStepPath = join(
  process.cwd(),
  "storefront/src/checkout/views/saleor-checkout/payment-step.tsx",
);

let content = readFileSync(paymentStepPath, "utf8");
let changed = false;

const oldGatewayNeedle = `// Dummy payment gateway ID (from Saleor Dummy Payment app)
const dummyGatewayId = "mirumee.payments.dummy";`;

const newGatewayNeedle = `const DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app", "mirumee.payments.dummy"] as const;

const findDummyGateway = (gateways: CheckoutFragment["availablePaymentGateways"]) =>
\tgateways?.find((gateway) => DUMMY_GATEWAY_IDS.includes(gateway.id as (typeof DUMMY_GATEWAY_IDS)[number]));`;

if (content.includes(oldGatewayNeedle)) {
  content = content.replace(oldGatewayNeedle, newGatewayNeedle);
  content = content.replace(
    "availablePaymentGateways?.find((gateway) => gateway.id === dummyGatewayId)",
    "findDummyGateway(availablePaymentGateways)",
  );
  changed = true;
  console.log("Patched payment-step.tsx: dummy payment app gateway IDs");
}

const oldCheckoutAssignment =
  "updatedCheckout = result.data?.checkoutBillingAddressUpdate?.checkout ?? checkout;";

const newCheckoutAssignment = `updatedCheckout = (result.data?.checkoutBillingAddressUpdate?.checkout ??
\t\t\t\t\t\tcheckout) as typeof checkout;`;

const spreadCheckoutAssignment = `updatedCheckout = {
\t\t\t\t\t...checkout,
\t\t\t\t\t...(result.data?.checkoutBillingAddressUpdate?.checkout ?? {}),
\t\t\t\t};`;

if (content.includes(oldCheckoutAssignment)) {
  content = content.replaceAll(oldCheckoutAssignment, newCheckoutAssignment);
  changed = true;
  console.log("Patched payment-step.tsx: checkout billing update type fix");
} else if (content.includes(spreadCheckoutAssignment)) {
  content = content.replaceAll(spreadCheckoutAssignment, newCheckoutAssignment);
  changed = true;
  console.log("Patched payment-step.tsx: checkout billing update type fix");
}

if (!changed) {
  const hasGatewayPatch = content.includes(
    'DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app"',
  );
  const hasCheckoutPatch = content.includes(
    ") as typeof checkout;",
  );

  if (hasGatewayPatch && hasCheckoutPatch) {
    console.log("storefront payment-step.tsx already patched for E2E");
    process.exit(0);
  }

  console.error(
    "Could not patch storefront payment-step.tsx — upstream format changed. Update scripts/patch-storefront-payment-step.mjs",
  );
  process.exit(1);
}

writeFileSync(paymentStepPath, content);
console.log("Patched storefront payment-step.tsx for E2E");

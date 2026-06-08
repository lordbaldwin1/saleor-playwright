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

function apply(oldText, newText, label) {
  if (!content.includes(oldText)) {
    return false;
  }
  content = content.replace(oldText, newText);
  changed = true;
  console.log(`Patched payment-step.tsx: ${label}`);
  return true;
}

// --- Current upstream storefront (hasDummyGateway / hasRealGateway) ---
const legacyGatewayDecl = `// Dummy payment gateway ID (from Saleor Dummy Payment app)
const dummyGatewayId = "mirumee.payments.dummy";`;

const e2eGatewayDecl = `const DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app", "mirumee.payments.dummy"] as const;
const isDummyGatewayId = (id: string) =>
\tDUMMY_GATEWAY_IDS.includes(id as (typeof DUMMY_GATEWAY_IDS)[number]);`;

apply(legacyGatewayDecl, e2eGatewayDecl, "dummy payment gateway IDs");

apply(
  `const hasDummyGateway = availableGateways.some((g) => g.id === dummyGatewayId);
\tconst hasRealGateway = availableGateways.some((g) => g.id !== dummyGatewayId);`,
  `const dummyGateway = availableGateways.find((g) => isDummyGatewayId(g.id));
\tconst hasDummyGateway = !!dummyGateway;
\tconst hasRealGateway = availableGateways.some((g) => !isDummyGatewayId(g.id));`,
  "dummy gateway detection",
);

apply(
  `\t\t\t\t\tid: dummyGatewayId,`,
  `\t\t\t\t\tid: dummyGateway!.id,`,
  "transaction gateway id",
);

// --- Older storefront (findDummyGateway helper) ---
apply(
  `const dummyGatewayId = "mirumee.payments.dummy";`,
  `const DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app", "mirumee.payments.dummy"] as const;

const findDummyGateway = (gateways: CheckoutFragment["availablePaymentGateways"]) =>
\tgateways?.find((gateway) => DUMMY_GATEWAY_IDS.includes(gateway.id as (typeof DUMMY_GATEWAY_IDS)[number]));`,
  "dummy payment gateway IDs (legacy layout)",
);

apply(
  "availablePaymentGateways?.find((gateway) => gateway.id === dummyGatewayId)",
  "findDummyGateway(availablePaymentGateways)",
  "find dummy gateway helper usage",
);

const oldCheckoutAssignment =
  "updatedCheckout = result.data?.checkoutBillingAddressUpdate?.checkout ?? checkout;";

const newCheckoutAssignment = `updatedCheckout = (result.data?.checkoutBillingAddressUpdate?.checkout ??
\t\t\t\t\t\tcheckout) as typeof checkout;`;

if (content.includes(oldCheckoutAssignment)) {
  content = content.replaceAll(oldCheckoutAssignment, newCheckoutAssignment);
  changed = true;
  console.log("Patched payment-step.tsx: checkout billing update type fix");
}

if (!changed) {
  const alreadyPatched =
    content.includes('DUMMY_GATEWAY_IDS = ["saleor.io.dummy-payment-app"') &&
    (content.includes("isDummyGatewayId") ||
      content.includes("findDummyGateway") ||
      content.includes(") as typeof checkout;"));

  if (alreadyPatched) {
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

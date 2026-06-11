import {
  AddressInput,
  CheckoutAddressValidationRules,
  CheckoutApi,
} from "../../api-client/CheckoutApi";
import { GqlClient } from "../../api-client/GqlClient";
import { test, expect } from "../../fixtures";

test.describe("checkout integration tests", () => {
  test("guest checkout happy path", async ({ request }) => {
    const email = `checkout-${Math.floor(Math.random() * 10000)}@example.com`;
    // this should be added to a fixture and fetched from that dynamically
    const variantId = "UHJvZHVjdFZhcmlhbnQ6Mzg0";
    const quantity = 1;
    const mockAddressInput: AddressInput = {
      firstName: "John",
      lastName: "Doe",
      companyName: "Acme Corp",
      streetAddress1: "123 Main St",
      streetAddress2: "Suite 1",
      city: "Springfield",
      cityArea: "Downtown",
      postalCode: "97015",
      country: "US",
      countryArea: "OR",
      phone: "+15035555555",
      skipValidation: false,
    };
    const mockCheckoutAddressValidationRules: CheckoutAddressValidationRules = {
      checkRequiredFields: true,
      checkFieldsFormat: true,
      enableFieldsNormalization: false,
    };
    const api = new CheckoutApi(new GqlClient(request));

    const {
      checkoutCreate: {
        checkout: createdCheckout,
        errors: checkoutCreateErrors,
      },
    } = await api.checkoutCreate(email, variantId, quantity);
    expect(createdCheckout).not.toBeNull();
    expect(checkoutCreateErrors).toHaveLength(0);
    expect(createdCheckout!.email).toBe(email);

    const {
      checkoutEmailUpdate: {
        checkout: emailUpdatedCheckout,
        errors: checkoutEmailUpdateErrors,
      },
    } = await api.checkoutEmailUpdate(
      createdCheckout!.email,
      createdCheckout!.id,
    );
    expect(emailUpdatedCheckout).not.toBeNull();
    expect(checkoutEmailUpdateErrors).toHaveLength(0);
    expect(emailUpdatedCheckout!.email).toBe(email);
    expect(emailUpdatedCheckout!.id).toBe(createdCheckout!.id);

    // should also return and check that returned shipping/billing address
    // matches the input
    const {
      checkoutShippingAddressUpdate: {
        checkout: shippingAddressUpdatedCheckout,
        errors: checkoutShippingAddressUpdateErrors,
      },
      checkoutBillingAddressUpdate: {
        checkout: billingAddressUpdatedCheckout,
        errors: checkoutBillingAddressUpdateErrors,
      },
    } = await api.checkoutShippingAndBillingAddressUpdate(
      createdCheckout!.id,
      mockAddressInput,
      mockCheckoutAddressValidationRules,
    );
    expect(shippingAddressUpdatedCheckout).not.toBeNull();
    expect(billingAddressUpdatedCheckout).not.toBeNull();
    expect(checkoutShippingAddressUpdateErrors).toHaveLength(0);
    expect(checkoutBillingAddressUpdateErrors).toHaveLength(0);
    expect(shippingAddressUpdatedCheckout!.id).toBe(createdCheckout!.id);
    expect(billingAddressUpdatedCheckout!.id).toBe(createdCheckout!.id);
    expect(shippingAddressUpdatedCheckout!.email).toBe(email);
    expect(billingAddressUpdatedCheckout!.email).toBe(email);

    const {
      deliveryOptionsCalculate: {
        deliveries,
        errors: deliveryOptionsCalculationErrors,
      },
    } = await api.deliveryOptionsCalculate(createdCheckout!.id);
    const deliveryMethodId = deliveries.at(-1)!.id;

    // should also check that the checkout delivery method returned
    // matches the selected one but im too lazy atm
    const {
      checkoutDeliveryMethodUpdate: {
        checkout: deliveryMethodUpdatedCheckout,
        errors,
      },
    } = await api.checkoutDeliveryMethodUpdate(
      createdCheckout!.id,
      deliveryMethodId,
    );
    // assertions on deliveryMethod update

    const {
      checkout: {
        shippingPrice: {
          gross: { amount: shippingAmount },
        },
        subtotalPrice: {
          gross: { amount: subtotalAmount },
        },
        totalPrice: {
          gross: { amount: totalAmount },
        },
      },
    } = await api.checkout(createdCheckout!.id);
    expect(Math.round((shippingAmount + subtotalAmount) * 100) / 100).toBe(
      Math.round(totalAmount * 100) / 100,
    );
  });
});

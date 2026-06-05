import type { CreditCardDetails, ShippingDetails } from "../pages/CheckoutPage";

export type TestProduct = {
  name: string;
  slug: string;
  searchQuery: string;
  price?: string;
};

export type CheckoutTestData = {
  shipping: ShippingDetails;
  creditCard: CreditCardDetails;
  shippingMethod: string;
};

export const testData = {
  testProduct: {
    name: "Grey Hoodie",
    slug: "grey-hoodie",
    searchQuery: "Hoodie",
    price: "30.00",
  } satisfies TestProduct,
  multiVariantTestProduct: {
    name: "White Plimsolls",
    slug: "white-plimsolls",
    searchQuery: "Plimsolls",
  } satisfies TestProduct,
  checkout: {
    shipping: {
      email: "test@example.com",
      country: "US",
      firstName: "John",
      lastName: "Doe",
      streetAddress: "123 Main St",
      city: "Portland",
      postalCode: "97015",
      state: "Oregon",
    },
    creditCard: {
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvc: "123",
      nameOnCard: "John Doe",
    },
    shippingMethod: "Default",
  } satisfies CheckoutTestData,
};

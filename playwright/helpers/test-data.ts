export type TestProduct = {
  name: string;
  slug: string;
  searchQuery: string;
  price?: string;
};

export type ShippingDetails = {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state?: string;
  company?: string;
  streetAddress2?: string;
  postalCode?: string;
  phone?: string;
};

export type CreditCardDetails = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
};

export type CheckoutData = {
  shipping: ShippingDetails;
  creditCard: CreditCardDetails;
  shippingMethod: string;
};

export type TestData = {
  testProduct: TestProduct;
  multiVariantTestProduct: TestProduct;
  checkout: CheckoutData;
};

export const testData = {
  testProduct: {
    name: "Grey Hoodie",
    slug: "grey-hoodie",
    searchQuery: "Hoodie",
    price: "30.00",
  },
  multiVariantTestProduct: {
    name: "White Plimsolls",
    slug: "white-plimsolls",
    searchQuery: "Plimsolls",
  },
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
  },
} satisfies TestData;

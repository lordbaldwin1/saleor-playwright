import { NavigationOptions } from "../pages/Navigation";

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

export type ShippingMethods = "Default" | "EMS" | "FedEx" | "UPS" | "DHL";

export type CheckoutData = {
  shipping: ShippingDetails;
  creditCard: CreditCardDetails;
  shippingMethod: ShippingMethods;
};

export type NavigationTestCase = {
  option: NavigationOptions;
  expectedUrl: string;
};

export const navigationTestCases: NavigationTestCase[] = [
  {
    option: "home",
    expectedUrl: "/default-channel",
  },
  {
    option: "all",
    expectedUrl: "/default-channel/products",
  },
  {
    option: "apparel",
    expectedUrl: "/default-channel/categories/apparel",
  },
  {
    option: "accessories",
    expectedUrl: "/default-channel/categories/accessories",
  },
  {
    option: "groceries",
    expectedUrl: "/default-channel/categories/groceries",
  },
  {
    option: "login",
    expectedUrl: "/default-channel/login",
  },
];

export type TestData = {
  testProduct: TestProduct;
  multiVariantTestProduct: TestProduct;
  guestCheckout: CheckoutData;
  guestCheckoutNonDefaultShippingMethod: CheckoutData;
  voucherCode: { code: string; discountValue: number };
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
  guestCheckout: {
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
  guestCheckoutNonDefaultShippingMethod: {
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
      expiry: "12/34",
      cvc: "123",
      nameOnCard: "John Doe",
    },
    shippingMethod: "FedEx",
  },
  voucherCode: { // sample voucher PW-1780794899003
    code: `PW-${Date.now()}`,
    discountValue: 10,
  },
} satisfies TestData;

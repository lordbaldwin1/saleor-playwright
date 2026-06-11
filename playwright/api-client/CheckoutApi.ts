import { config } from "../config";
import { apiLoginRequestContext } from "../helpers/auth";
import { AuthApi } from "./AuthApi";
import { GqlClient } from "./GqlClient";

export class CheckoutApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async checkoutCreate(email: string, variantId: string, quantity: number) {
    const mutation = `
      mutation CheckoutCreate(
        $channel: String!,
        $email: String!,
        $variantId: ID!,
        $quantity: Int!
      ) {
        checkoutCreate(
          input: {
            channel: $channel,
            email: $email,
            lines: {
              variantId: $variantId,
              quantity: $quantity
            }
          }
        ) {
          checkout {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const variables = {
      channel: config.defaultChannel,
      email,
      variantId,
      quantity,
    };

    const data = await this.gqlClient.mutation<{
      checkoutCreate: {
        checkout: {
          id: string;
          email: string;
        } | null;
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(mutation, variables);
    return data;
  }

  async checkoutEmailUpdate(email: string, checkoutId: string) {
    const mutation = `
      mutation CheckoutEmailUpdate($email: String!, $id: ID!) {
        checkoutEmailUpdate(email: $email, id: $id) {
          checkout {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const variables = {
      email,
      id: checkoutId,
    };

    const data = await this.gqlClient.mutation<{
      checkoutEmailUpdate: {
        checkout: {
          id: string;
          email: string;
        } | null;
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(mutation, variables);
    return data;
  }

  async checkoutShippingAndBillingAddressUpdate(
    checkoutId: string,
    addressInput: AddressInput,
    validationRules: CheckoutAddressValidationRules,
  ) {
    const mutation = `
      mutation CheckoutUpdateShippingAndBillingAddress(
        $id: ID!,
        $shippingAddress: AddressInput!,
        $billingAddress: AddressInput!,
        $validationRules: CheckoutAddressValidationRules,
      ) {
        checkoutShippingAddressUpdate(
          id: $id,
          shippingAddress: $shippingAddress,
          validationRules: $validationRules,
        ) {
          checkout {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
        checkoutBillingAddressUpdate(
          id: $id,
          billingAddress: $billingAddress,
          validationRules: $validationRules,
        ) {
          checkout {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const variables = {
      id: checkoutId,
      shippingAddress: addressInput,
      billingAddress: addressInput,
      validationRules,
    };

    const data = await this.gqlClient.mutation<{
      checkoutShippingAddressUpdate: {
        checkout: {
          id: string;
          email: string;
        } | null;
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
      checkoutBillingAddressUpdate: {
        checkout: {
          id: string;
          email: string;
        } | null;
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(mutation, variables);
    return data;
  }

  async deliveryOptionsCalculate(checkoutId: string) {
    const mutation = `
      mutation DeliveryOptionsCalculate($id: ID!) {
        deliveryOptionsCalculate(id: $id) {
          deliveries {
            id
            shippingMethod {
              id
            }
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const variables = {
      id: checkoutId,
    };

    const data = await this.gqlClient.mutation<{
      deliveryOptionsCalculate: {
        deliveries: {
          id: string;
          shippingMethod: {
            id: string;
          };
        }[];
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(mutation, variables);
    return data;
  }

  async checkoutDeliveryMethodUpdate(
    checkoutId: string,
    deliveryMethodId: string,
  ) {
    const mutation = `
      mutation CheckoutDeliveryMethodUpdate(
        $deliveryMethodId: ID!, 
        $id: ID!
      ) {
        checkoutDeliveryMethodUpdate(
          deliveryMethodId: $deliveryMethodId,
          id: $id
        ) {
          checkout {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const variables = {
      deliveryMethodId,
      id: checkoutId,
    };
    const data = await this.gqlClient.mutation<{
      checkoutDeliveryMethodUpdate: {
        checkout: {
          id: string;
          email: string;
        };
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(mutation, variables);
    return data;
  }

  async checkout(checkoutId: string) {
    const adminRequest = await apiLoginRequestContext(
      config.adminEmail,
      config.adminPassword,
    );
    const adminGqlClient = new GqlClient(adminRequest);

    const query = `
      query Checkout($id: ID!) {
        checkout(id: $id) {
          shippingPrice {
            gross {
              amount
            }
          }
          subtotalPrice {
            gross {
              amount
            }
          }
          totalPrice {
            gross {
              amount
            }
          }
        }
      }
    `;
    const variables = {
      id: checkoutId,
    };

    const data = await adminGqlClient.query<{
      checkout: {
        shippingPrice: {
          gross: {
            amount: number;
          }
        }
        subtotalPrice: {
          gross: {
            amount: number;
          }
        }
        totalPrice: {
          gross: {
            amount: number;
          }
        }
      }
    }>(query, variables);
    return data;
  }
}

export type AddressInput = {
  firstName: string;
  lastName: string;
  companyName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  cityArea: string;
  postalCode: string;
  country: string;
  countryArea: string;
  phone: string;
  skipValidation: boolean;
};

export type CheckoutAddressValidationRules = {
  checkRequiredFields: boolean;
  checkFieldsFormat: boolean;
  enableFieldsNormalization: boolean;
};

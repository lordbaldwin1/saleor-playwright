import { GqlClient } from "./GqlClient";
import { config } from "../config";
import { request } from "@playwright/test";

export class AuthApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async createCustomer(email: string, password: string) {
    const query = `
      mutation AccountRegister(
        $channel: String!,
        $email: String!,
        $password: String!
      ) {
        accountRegister(
          input: {
            channel: $channel,
            email: $email,
            password: $password
          }
        ) {
          requiresConfirmation
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
      password,
    };
    const { accountRegister } = await this.gqlClient.mutation<{
      accountRegister: {
        requiresConfirmation: boolean;
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>(query, variables);
    return accountRegister;
  }

  async createToken(email: string, password: string) {
    const query = `
      mutation TokenCreate($email: String!, $password: String!) {
        tokenCreate(email: $email, password: $password) {
          token
          refreshToken
          csrfToken
          errors {
            field
            message
            code
          }
        }
      }
    `;

    const { tokenCreate } = await this.gqlClient.mutation<{
      tokenCreate: {
        token: string | null;
        refreshToken: string | null;
        csrfToken: string | null;
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>(query, { email, password });
    return tokenCreate;
  }

  async tokenVerify(token: string) {
    const query = `
      mutation TokenVerify($token: String!) {
        tokenVerify(token: $token) {
          isValid
          errors {
            field
            message
            code
          }
        }
      }`;
    const variables = {
      token,
    };

    const { tokenVerify } = await this.gqlClient.mutation<{
      tokenVerify: {
        isValid: boolean;
        errors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    }>(query, variables);
    return tokenVerify;
  }

  async me(token: string) {
    const query = `
      query Me {
        me {
          email
        }
      }
    `;
    const authRequest = await request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    try {
      const { me } = await new GqlClient(authRequest).query<{
        me: { email: string } | null;
      }>(query);
      return me;
    } finally {
      await authRequest.dispose();
    }
  }
}

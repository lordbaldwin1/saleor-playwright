import { GqlClient } from "./GqlClient";
import { config } from "../config";

export class AuthApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async createCustomer(email: string, password: string) {
    const redirectUrl = config.storefrontUrl;
    const channel = config.defaultChannel;
    const query = `
      mutation RegisterAccount($email: String!, $password: String!, $redirectUrl: String, $channel: String) {
        accountRegister(input: {email: $email, password: $password, redirectUrl: $redirectUrl, channel: $channel}) {
          errors {
            field
            message
          }
          requiresConfirmation
        }
      }
    `;
    const { accountRegister } = await this.gqlClient.mutation<{
      accountRegister: {
        requiresConfirmation: boolean;
        errors: Array<{ field: string; message: string }>;
      };
    }>(query, { email, password, redirectUrl, channel });

    if (accountRegister.errors.length > 0) {
      throw new Error(
        accountRegister.errors
          .map((e) => `${e.field ?? "?"}: ${e.message}`)
          .join("; "),
      );
    }

    if (accountRegister.requiresConfirmation) {
      throw new Error("Account requires confirmation");
    }
  }

  async createToken(email: string, password: string) {
    const query = `
      mutation TokenCreate($email: String!, $password: String!) {
        tokenCreate(email: $email, password: $password) {
          token
          refreshToken
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
        token: string;
        refreshToken: string;
        errors: Array<{ field: string; message: string; code: string }>;
      };
    }>(query, { email, password });

    if (tokenCreate.errors.length > 0) {
      throw new Error(
        tokenCreate.errors
          .map((e) => `${e.field ?? "?"}: ${e.message}`)
          .join("; "),
      );
    }

    return tokenCreate;
  }
}

import { GqlClient } from "./GqlClient";
import { config } from "../config";

type SaleorError = { field: string; message: string; code: string };

function assertNoErrors(errors: SaleorError[]) {
  if (errors.length > 0) {
    throw new Error(
      errors.map((e) => `${e.field ?? "?"}: ${e.message}`).join("; "),
    );
  }
}

export class VoucherApi {
  private readonly gqlClient: GqlClient;

  constructor(gqlClient: GqlClient) {
    this.gqlClient = gqlClient;
  }

  async createFixedOrderVoucher(options: {
    code: string;
    discountValue: number;
    channelSlug?: string;
  }) {
    const { code, discountValue, channelSlug = config.defaultChannel } =
      options;

    const voucher = await this.createVoucher(code);
    const channel = await this.getChannelBySlug(channelSlug);
    await this.updateVoucherChannelListing(
      voucher.id,
      channel.id,
      discountValue,
    );

    return { code, discountValue };
  }

  async createVoucher(code: string) {
    const mutation = `
      mutation VoucherCreate($input: VoucherInput!) {
        voucherCreate(input: $input) {
          voucher {
            id
            code
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;

    const { voucherCreate } = await this.gqlClient.mutation<{
      voucherCreate: {
        voucher: { id: string; code: string };
        errors: SaleorError[];
      };
    }>(mutation, {
      input: {
        name: "Playwright APIRequestContext Voucher",
        addCodes: [code],
        type: "ENTIRE_ORDER",
        discountValueType: "FIXED",
        applyOncePerOrder: true,
        singleUse: true,
      },
    });

    assertNoErrors(voucherCreate.errors);
    return voucherCreate.voucher;
  }

  async updateVoucherChannelListing(
    voucherId: string,
    channelId: string,
    discountValue: number,
  ) {
    const mutation = `
      mutation VoucherChannelListingUpdate(
        $id: ID!
        $input: VoucherChannelListingInput!
      ) {
        voucherChannelListingUpdate(id: $id, input: $input) {
          errors {
            field
            message
            code
          }
        }
      }
    `;

    const { voucherChannelListingUpdate } = await this.gqlClient.mutation<{
      voucherChannelListingUpdate: {
        errors: SaleorError[];
      };
    }>(mutation, {
      id: voucherId,
      input: {
        addChannels: [{ channelId, discountValue }],
      },
    });

    assertNoErrors(voucherChannelListingUpdate.errors);
  }

  private async getChannelBySlug(slug: string) {
    const query = `query Channels { channels { id slug } }`;

    const { channels } = await this.gqlClient.query<{
      channels: Array<{ id: string; slug: string }>;
    }>(query);

    const channel = channels.find((c) => c.slug === slug);
    if (!channel) {
      throw new Error(`Channel not found: ${slug}`);
    }

    return channel;
  }
}

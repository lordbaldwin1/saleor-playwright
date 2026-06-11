import fs from "fs/promises";
import path from "path";
import { GqlClient } from "../api-client/GqlClient";
import { VoucherApi } from "../api-client/VoucherApi";
import { config } from "../config";
import { apiLoginRequestContext } from "./auth";

export type TestVoucher = { code: string; discountValue: number };

export async function saveTestVoucher(voucher: TestVoucher): Promise<void> {
  const adminRequest = await apiLoginRequestContext(
    config.adminEmail,
    config.adminPassword,
  );
  try {
    const voucherApi = new VoucherApi(new GqlClient(adminRequest));
    await voucherApi.createFixedOrderVoucher({
      code: voucher.code,
      discountValue: voucher.discountValue,
      singleUse: false,
    });
    await fs.mkdir(path.dirname(config.voucherFile), { recursive: true });
    await fs.writeFile(config.voucherFile, JSON.stringify(voucher), "utf-8");
  } finally {
    await adminRequest.dispose();
  }
}

export async function loadTestVoucher(): Promise<TestVoucher> {
  const raw = await fs.readFile(config.voucherFile, "utf-8");
  return JSON.parse(raw) as TestVoucher;
}

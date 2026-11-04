import { rawRequest } from "./request";
import {
  PageResult,
  Result,
  UserWalletItem,
  WalletBalanceItem,
  WalletLogItem,
  WalletTemplate
} from "./types";

/**
 * Wallet — хэрэглэгчийн хэтэвч (Auth.mn main API, /main/v1/wallet/*).
 *
 * Эдгээр нь бүгд ХЭРЭГЛЭГЧИЙН token-оор дуудагддаг: frontend-ээс ирсэн
 * Bearer token-ийг эхний аргумент болгон өгнө. Client permission шаардахгүй.
 *
 *   // Хэтэвч үүсгэх (апп-ын key_id-ээр, ж: "SELLER-APP")
 *   const w = await authMn.wallet.create(userToken, "SELLER-APP");
 *   // Үлдэгдэл (хэрэглэгчийн бүх хэтэвч)
 *   const b = await authMn.wallet.balance(userToken);
 *   // Гүйлгээний лог
 *   const l = await authMn.wallet.logs(userToken, { wallet_id: w.data?.wallet_id });
 *
 * Хэрэглэгчийн wallet_id/wallet_key-г сервер талаас token-гүй авах бол
 * authMn.user.find({ user_id }) → data.wallets (permission: user.read).
 */

/** Үүсгэж болох хэтэвчний загварууд */
export const templates = (token: string): Promise<Result<WalletTemplate[]>> =>
  rawRequest<WalletTemplate[]>(
    { method: "GET", path: "/main/v1/wallet/list", name: "wallet templates", auth: false },
    token
  );

/**
 * Хэтэвч үүсгэх. Хэрэглэгч тухайн key_id-ийн хэтэвчтэй бол байгааг нь буцаана.
 * key_id нь Auth.mn дээр бүртгэлтэй байх ёстой (ERR_WALLET_KEY).
 */
export const create = (
  token: string,
  key_id: string
): Promise<Result<UserWalletItem>> =>
  rawRequest<UserWalletItem>(
    {
      method: "POST",
      path: "/main/v1/wallet/create",
      name: "wallet create",
      data: { key_id },
      auth: false
    },
    token
  );

/** Хэрэглэгчийн бүх хэтэвчний үлдэгдэл */
export const balance = (token: string): Promise<Result<WalletBalanceItem[]>> =>
  rawRequest<WalletBalanceItem[]>(
    { method: "GET", path: "/main/v1/wallet/balance", name: "wallet balance", auth: false },
    token
  );

/** Гүйлгээний лог (wallet_id өгөхгүй бол бүх хэтэвч) */
export const logs = (
  token: string,
  params: {
    wallet_id?: string;
    /** NORMAL | FEE | REFUND */
    tra_type?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<Result<PageResult<WalletLogItem>>> =>
  rawRequest<PageResult<WalletLogItem>>(
    { method: "GET", path: "/main/v1/wallet/logs", name: "wallet logs", params, auth: false },
    token
  );

export default { templates, create, balance, logs };

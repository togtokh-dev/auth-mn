import { config } from "./index";
import { rawRequest } from "./request";
import { ExpAddResult, ExpLog, PageResult, Result } from "./types";

/**
 * EXP — хэрэглэгчид exp нэмэх.
 *
 * Admin panel → "EXP түлхүүр" дээр нэр (ж: Seller Panda) + нэг дуудлагад олгох exp-тэй
 * түлхүүр үүсгэнэ. Энэ түлхүүр client_id/secret-ээс тусдаа: setExpKey("exp_…")-ээр
 * тохируулна (эсвэл дуудлага бүрт key өгнө).
 *
 *   import authMn, { setExpKey } from "auth-mn";
 *   setExpKey(process.env.AUTH_MN_EXP_KEY);
 *   await authMn.exp.add({ user_id: 8636569, desc: "Худалдан авалт #1234", ref: "order-1234" });
 *   // эсвэл frontend-ээс ирсэн хэрэглэгчийн token-оор:
 *   await authMn.exp.add({ token: userToken, desc: "Худалдан авалт" });
 *
 * Хэдэн exp нэмэгдэх нь түлхүүр дээр admin-ийн тохируулсан хэмжээ — дуудагч тал өөрчилж чадахгүй.
 * `ref` өгвөл ижил ref-ээр дахин дуудахад давхар нэмэхгүй (data.duplicate = true).
 */

const keyOf = (key?: string) => {
  const k = (key || config.expKey || "").trim();
  if (!k) throw new Error("[auth-mn] EXP түлхүүр тохируулаагүй байна: setExpKey(\"exp_…\")");
  return k;
};

export const add = (
  input: { user_id?: number | string; token?: string; desc: string; ref?: string },
  key?: string
): Promise<Result<ExpAddResult>> => {
  let k: string;
  try {
    k = keyOf(key);
  } catch (e) {
    return Promise.resolve({ success: false, message: (e as Error).message, data: null, status: 0 });
  }
  return rawRequest<ExpAddResult>(
    { method: "POST", path: "/main/v1/auth/exp/add", name: "exp add", data: input, auth: false },
    k
  );
};

/** Тухайн түлхүүрээр нэмсэн exp-ийн лог (user_id-ээр шүүж болно) */
export const logs = (
  filter: { user_id?: number | string; page?: number; limit?: number } = {},
  key?: string
): Promise<Result<PageResult<ExpLog>>> => {
  let k: string;
  try {
    k = keyOf(key);
  } catch (e) {
    return Promise.resolve({ success: false, message: (e as Error).message, data: null, status: 0 });
  }
  return rawRequest<PageResult<ExpLog>>(
    { method: "GET", path: "/main/v1/auth/exp/logs", name: "exp logs", params: filter, auth: false },
    k
  );
};

export default { add, logs };

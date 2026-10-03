import { request } from "./request";
import { Result, UserT, VerifiedUser } from "./types";

/**
 * Хэрэглэгчийн token-ийг Auth.mn сервер дээр баталгаажуулж, хэрэглэгчийн
 * мэдээллийг авна. Frontend (auth-mn-react redirect / QR / OTP) -ээс ирсэн
 * token-ийг backend дээрээ ингэж шалгана. Permission: user.verify
 *
 *   const v = await authMn.user.verify(token);
 *   if (!v.success) return res.status(401).json({ message: v.message });
 *   v.data.user.user_id ...
 */
export const verify = (token: string): Promise<Result<VerifiedUser>> =>
  request<VerifiedUser>({
    method: "POST",
    path: "/main/v1/auth/client/user/verify",
    name: "user verify",
    data: { token }
  });

/**
 * Хэрэглэгч хайх — user_id, phone_number эсвэл email-ийн аль нэгээр (нэг хэрэглэгч).
 * Permission: user.read
 */
export const find = (query: {
  user_id?: number | string;
  phone_number?: string;
  email?: string;
}): Promise<Result<UserT>> =>
  request<UserT>({ method: "POST", path: "/main/v1/auth/client/user/find", name: "user find", data: query });

/* -----------------------------
 * Express / Koa / Fastify-д зориулсан middleware
 * ----------------------------- */

type AnyReq = { headers: Record<string, any>; query?: any; body?: any; [k: string]: any };
type AnyRes = { status: (code: number) => { json: (b: any) => any } };
type Next = (err?: any) => void;

export type MiddlewareOptions = {
  /** false бол token байхгүй/буруу үед алдаа өгөхгүй, req.authMnUser = null байж next() (default true) */
  required?: boolean;
  /** Token-ийг хаанаас авах: default Authorization: Bearer, дараа нь ?authToken= / body.authToken */
  getToken?: (req: AnyReq) => string | undefined | null;
  /** Хэрэглэгчийн мэдээллийг хадгалах талбарын нэр (default "authMnUser") */
  property?: string;
};

const defaultGetToken = (req: AnyReq): string | undefined => {
  const h = String(req.headers?.authorization || req.headers?.Authorization || "");
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1].trim();
  return req.query?.authToken || req.body?.authToken || undefined;
};

/**
 * Express middleware — Auth.mn хэрэглэгчийн token-ийг шалгаад req.authMnUser-д хадгална.
 *
 *   app.get("/api/me", authMn.user.middleware(), (req, res) => res.json(req.authMnUser));
 *
 * Санамж: хүсэлт бүрт Auth.mn руу нэг дуудлага хийнэ. Ачаалал ихтэй бол нэвтрэх үед
 * нэг удаа verify хийгээд өөрийн session/JWT үүсгэх нь дээр.
 */
export const middleware =
  (opts: MiddlewareOptions = {}) =>
  async (req: AnyReq, res: AnyRes, next: Next) => {
    const required = opts.required !== false;
    const prop = opts.property || "authMnUser";
    const token = (opts.getToken || defaultGetToken)(req);
    if (!token) {
      req[prop] = null;
      if (!required) return next();
      return res.status(401).json({ success: false, message: "Нэвтрээгүй байна.", code: "401", data: null });
    }
    const v = await verify(token);
    if (!v.success || !v.data?.user) {
      req[prop] = null;
      if (!required) return next();
      return res
        .status(v.status === 403 ? 403 : 401)
        .json({ success: false, message: v.message || "Token хүчингүй.", code: "401", data: null });
    }
    req[prop] = v.data.user;
    req[`${prop}Token`] = token;
    return next();
  };

export default { verify, find, middleware };

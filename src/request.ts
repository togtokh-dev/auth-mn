import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import { config } from "./index";
import { ApiResponse, Result } from "./types";

export type RequestOpts = {
  method: Method;
  path: string;
  data?: any;
  params?: Record<string, any>;
  name?: string;
  /** Bearer token автоматаар нэмэх эсэх (default true) */
  auth?: boolean;
  host?: "MAIN" | "WALLET";
};

const log = (name: string, info: Record<string, any>) => {
  if (config.logger) console.log(`[auth-mn] ${name}`, info);
};

/** Нэг удаагийн HTTP хүсэлт — Result<T> буцна, throw хийхгүй */
export const rawRequest = async <T>(opts: RequestOpts, token?: string): Promise<Result<T>> => {
  const url = `${config.hosts[opts.host || "MAIN"]}${opts.path}`;
  const req: AxiosRequestConfig = {
    method: opts.method,
    url,
    data: opts.data,
    params: opts.params,
    timeout: config.timeout,
    maxBodyLength: Infinity,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    // 4xx-ийг throw хийлгэхгүй, өөрсдөө боловсруулна
    validateStatus: () => true
  };
  const started = Date.now();
  try {
    const res = await axios.request<ApiResponse<T>>(req);
    const body = res.data || ({} as ApiResponse<T>);
    log(opts.name || opts.path, {
      status: res.status,
      ms: Date.now() - started,
      success: body.success,
      message: body.message
    });
    return {
      success: body.success === true,
      message: body.message || (res.status >= 400 ? `HTTP ${res.status}` : ""),
      data: (body as any).data ?? null,
      status: res.status
    };
  } catch (error) {
    const e = error as AxiosError;
    log(opts.name || opts.path, { error: e.message, ms: Date.now() - started });
    return { success: false, message: e.message || "Network error", data: null, status: 0 };
  }
};

/**
 * Token-той хүсэлт: хүчинтэй access token авч (шаардлагатай бол refresh)
 * илгээнэ; 401 ирвэл token-оо шинэчилж нэг удаа дахин оролдоно.
 */
export const request = async <T>(opts: RequestOpts): Promise<Result<T>> => {
  // circular import-оос зайлсхийж энд дуудна
  const { getToken, authState } = await import("./auth");
  if (opts.auth === false) return rawRequest<T>(opts);

  let token = await getToken();
  if (!token) {
    return {
      success: false,
      message:
        authState.lastError ||
        "Auth.mn token авч чадсангүй. setAuth({ client_id, client_secret }) тохируулсан эсэхээ шалгана уу.",
      data: null,
      status: 401
    };
  }
  let res = await rawRequest<T>(opts, token);
  if (res.status === 401) {
    authState.clear();
    token = await getToken();
    if (token) res = await rawRequest<T>(opts, token);
  }
  return res;
};

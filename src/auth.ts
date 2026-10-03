import { config } from "./index";
import { rawRequest, request } from "./request";
import { ClientInfo, PermissionGroup, Result, TokenData } from "./types";

/** Хугацаа дуусахаас хэдэн секундын өмнө refresh хийх */
const REFRESH_MARGIN_SEC = 60;

export class AuthState {
  accessToken = "";
  refreshToken = "";
  /** ms epoch */
  accessExpiresAt = 0;
  refreshExpiresAt = 0;
  permissions: string[] = [];
  lastError = "";
  pending: Promise<string> | null = null;

  get token() {
    return this.accessToken;
  }

  isAccessValid() {
    return !!this.accessToken && Date.now() < this.accessExpiresAt - REFRESH_MARGIN_SEC * 1000;
  }

  isRefreshValid() {
    return !!this.refreshToken && Date.now() < this.refreshExpiresAt - 5000;
  }

  apply(d: TokenData) {
    this.accessToken = d.access_token;
    config.token = d.access_token;
    this.refreshToken = d.refresh_token;
    this.accessExpiresAt = Date.now() + d.expires_in * 1000;
    this.refreshExpiresAt = Date.now() + d.refresh_expires_in * 1000;
    this.permissions = d.permissions || [];
    this.lastError = "";
  }

  clear() {
    this.accessToken = "";
    config.token = "";
    this.refreshToken = "";
    this.accessExpiresAt = 0;
    this.refreshExpiresAt = 0;
    this.permissions = [];
  }

  /** Зэрэг олон хүсэлт ирэхэд нэг л удаа token авна */
  single(fn: () => Promise<string>): Promise<string> {
    if (!this.pending) {
      this.pending = fn().finally(() => (this.pending = null));
    }
    return this.pending;
  }
}

export const authState = new AuthState();

/** client_id + client_secret → шинэ token хос */
export const login = async (): Promise<Result<TokenData>> => {
  if (!config.auth.client_id || !config.auth.client_secret) {
    authState.lastError = "client_id / client_secret тохируулаагүй байна (setAuth).";
    return { success: false, message: authState.lastError, data: null, status: 0 };
  }
  const res = await rawRequest<TokenData>({
    method: "POST",
    path: "/main/v1/auth/client/token",
    name: "client token",
    data: { client_id: config.auth.client_id, client_secret: config.auth.client_secret }
  });
  if (res.success && res.data?.access_token) authState.apply(res.data);
  else authState.lastError = res.message;
  return res;
};

/** refresh_token → шинэ token хос (хуучин refresh хүчингүй болно) */
export const refresh = async (): Promise<Result<TokenData>> => {
  if (!authState.isRefreshValid()) {
    return { success: false, message: "refresh token алга эсвэл хугацаа дууссан", data: null, status: 0 };
  }
  const res = await rawRequest<TokenData>({
    method: "POST",
    path: "/main/v1/auth/client/token/refresh",
    name: "client token refresh",
    data: { refresh_token: authState.refreshToken }
  });
  if (res.success && res.data?.access_token) authState.apply(res.data);
  else {
    authState.clear();
    authState.lastError = res.message;
  }
  return res;
};

/**
 * Хүчинтэй access token буцаана (cache → refresh → login).
 * Бусад бүх API функц үүнийг автоматаар дуудна.
 */
export const getToken = (): Promise<string> =>
  authState.single(async () => {
    if (authState.isAccessValid()) return authState.accessToken;
    if (authState.isRefreshValid()) {
      const r = await refresh();
      if (r.success) return authState.accessToken;
    }
    const l = await login();
    return l.success ? authState.accessToken : "";
  });

/** Одоогийн access token (хоосон бол авч амжаагүй) — config.token-той ижил */
export const token = (): string => config.token;

/** Одоогийн refresh token-ийг серверт хүчингүй болгоод cache цэвэрлэнэ */
export const revoke = async (): Promise<Result<null>> => {
  const rt = authState.refreshToken;
  authState.clear();
  if (!rt) return { success: true, message: "token алга", data: null };
  return rawRequest<null>({
    method: "POST",
    path: "/main/v1/auth/client/token/revoke",
    name: "client token revoke",
    data: { refresh_token: rt }
  });
};

/** Client-ийн мэдээлэл + олгогдсон permission */
export const me = (): Promise<Result<ClientInfo>> =>
  request<ClientInfo>({ method: "GET", path: "/main/v1/auth/client/me", name: "client me" });

/** Auth.mn-ийн бүх боломжит permission (public) */
export const permissions = (): Promise<Result<PermissionGroup[]>> =>
  rawRequest<PermissionGroup[]>({ method: "GET", path: "/main/v1/auth/client/permissions", name: "permissions" });

/** Энэ client тухайн эрхтэй эсэх (сүүлийн token-оос) */
export const hasPermission = (perm: string): boolean => {
  const p = authState.permissions;
  return p.includes("*") || p.includes(perm) || p.includes(`${perm.split(".")[0]}.*`);
};

/**
 * @deprecated v1.0.0-ээс: email/password-оор нэвтрэх боломжгүй болсон.
 * setAuth({ client_id, client_secret }) ашиглана уу. Одоо getToken()-ийг дуудна.
 */
export const TOKEN = async (_legacy?: { username: string; password: string }): Promise<string> => {
  if (_legacy && config.logger) {
    console.warn("[auth-mn] auth.TOKEN({username,password}) хуучирсан — setAuth({ client_id, client_secret }) ашиглана уу.");
  }
  return getToken();
};

export default { getToken, token, login, refresh, revoke, me, permissions, hasPermission, TOKEN, state: authState };

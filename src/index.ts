/**
 * auth-mn — Auth.mn API client (Node.js)
 *
 *   import authMn, { setAuth, setHost } from "auth-mn";
 *   setHost("prod");                                   // эсвэл setHost({ MAIN: "https://..." })
 *   setAuth({ client_id: "cl_...", client_secret: "sk_..." });
 *   const v = await authMn.user.verify(userTokenFromFrontend); // → v.data.user
 *
 * Token-ийг lib өөрөө авч, хугацаа дуусахаас өмнө refresh хийнэ.
 * Client-д олгосон permission-ээс гадуур API дуудвал 403 + message буцна.
 *
 * Хамрах хүрээ: хэрэглэгч (verify / find), мэдэгдэл (push / sms / mail),
 * socket (toast / status / orderStatus / emit). Merchant/admin зэрэг дотоод
 * бүртгэлүүд энэ санд байхгүй.
 */
import auth from "./auth";
import user from "./user";
import notification from "./notification";
import socket from "./socket";

export type Env = "prod" | "staging";

export type Config = {
  env: Env;
  hosts: { MAIN: string; WALLET: string };
  auth: { client_id: string; client_secret: string };
  logger: boolean;
  /** Хүсэлтийн timeout (ms), default 20000 */
  timeout: number;
};

const HOSTS: Record<Env, { MAIN: string; WALLET: string }> = {
  prod: { MAIN: "https://api.auth.mn", WALLET: "https://api.auth.mn" },
  staging: { MAIN: "https://staging-api.auth.mn", WALLET: "https://staging-api.auth.mn" }
};

export const config: Config = {
  env: "prod",
  hosts: { ...HOSTS.prod },
  auth: { client_id: "", client_secret: "" },
  logger: false,
  timeout: 20000
};

/** Host тохируулна: setHost("staging") эсвэл setHost({ MAIN, WALLET }, "prod") */
export const setHost = (
  hosts: Env | { MAIN: string; WALLET?: string },
  env?: Env
) => {
  if (typeof hosts === "string") {
    config.env = hosts;
    config.hosts = { ...HOSTS[hosts] };
  } else {
    config.hosts.MAIN = hosts.MAIN.replace(/\/$/, "");
    config.hosts.WALLET = (hosts.WALLET || hosts.MAIN).replace(/\/$/, "");
    if (env) config.env = env;
  }
  if (config.logger) console.log("[auth-mn] hosts:", config.hosts, "env:", config.env);
};

/** client_id + client_secret (Admin panel → Апп-ууд дээрээс авна) */
export const setAuth = (auth: { client_id: string; client_secret: string }) => {
  config.auth.client_id = auth.client_id;
  config.auth.client_secret = auth.client_secret;
  // шинэ credential → хуучин token-ийг хаяна
  authState.clear();
};

export const setLogger = (status: boolean) => {
  config.logger = status;
};

export const jsonToQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return query ? `?${query}` : "";
};

export const ObjectId = (): string => {
  const timestamp = ((Date.now() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16)).toLowerCase()
  );
};

import { authState } from "./auth";

export { auth, user, notification, socket, authState };
export * from "./types";

export default { auth, user, notification, socket, setAuth, setHost, setLogger, ObjectId };

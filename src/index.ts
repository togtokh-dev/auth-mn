import auth from "./auth";
import notification from "./notification";
import socket from "./socket";
import find from "./find";

export const jsonToQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return query ? `?${query}` : "";
};

export const ObjectId = (): string => {
  const timestamp = ((Date.now() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16))
      .toLowerCase()
  );
};

export type Config = {
  token: string;
  env: "prod" | "staging";
  hosts: {
    MAIN: string;
    WALLET: string;
  };
  auth: {
    username: string;
    password: string;
  };
  logger: boolean;
};

export const config: Config = {
  token: "",
  env: "staging",
  hosts: {
    MAIN: "https://staging-api.auth.mn",
    WALLET: "https://staging-api.auth.mn",
  },
  auth: {
    username: "",
    password: "",
  },
  logger: false,
};

// Function to set the host URLs for API requests
export const setHost = (
  { MAIN, WALLET }: { MAIN: string; WALLET: string },
  ENV: "staging" | "prod",
) => {
  config.hosts.MAIN = MAIN;
  config.hosts.WALLET = WALLET;
  config.env = ENV;

  console.log("Hosts set to:", config.hosts);
  console.log("Environment set to:", ENV);
};

// Function to enable or disable logging
export const setLogger = (status: boolean) => {
  config.logger = status;
  console.log("Logger status set to:", status);
};

export default {
  auth,
  ObjectId,
  notification,
  socket,
  find,
};

export { default as notification } from "./notification";
export { default as socket } from "./socket";
export { default as find } from "./find";

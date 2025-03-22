import { AxiosResponse } from "axios";
import { config } from "./";
import { axiosMasterMain } from "axios-master";

type ApiResponse<T> = {
  code: string;
  success: boolean;
  message: string;
  token?: string;
  data: T;
};

const TOKEN = async (auth: {
  username: string;
  password: string;
}): Promise<string> => {
  try {
    const response: ApiResponse<{}> = await axiosMasterMain(
      {
        method: "POST",
        url: `${config.hosts.MAIN}/main/v1/auth//client/create`,
        headers: {
          "Content-Type": "application/json",
        },

        data: {
          email: auth.username,
          password: auth.password,
        },
      },
      {
        name: "Token",
        timeout: 20000,
        logger: (data) => {
          if (config.logger) console.log(data);
        },
      },
    );

    if (response?.token) {
      config.token = response?.token;
      return response?.token;
    }

    return "";
  } catch (error) {
    const axiosError = error as AxiosResponse<ApiResponse<{}>>;
    if (axiosError.data) {
      console.log(axiosError.data);
    } else {
      console.error("Token Request Failed:", axiosError);
    }
    return "";
  }
};

export const getToken = async (): Promise<string> => {
  try {
    const response: ApiResponse<{}> = await axiosMasterMain(
      {
        method: "POST",
        url: `${config.hosts.MAIN}/main/v1/auth//client/create`,
        headers: {
          "Content-Type": "application/json",
        },

        data: {
          email: config.auth.username,
          password: config.auth.password,
        },
      },
      {
        name: "Token",
        timeout: 20000,
        logger: (data) => {
          if (config.logger) console.log(data);
        },
      },
    );

    if (response?.token) {
      config.token = response?.token;
      return response?.token;
    }

    return "";
  } catch (error) {
    const axiosError = error as AxiosResponse<ApiResponse<{}>>;
    if (axiosError.data) {
      console.log(axiosError.data);
    } else {
      console.error("Token Request Failed:", axiosError);
    }
    return "";
  }
};

export default { TOKEN };

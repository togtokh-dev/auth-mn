import { config } from ".";
import { getToken } from "./auth";
import { axiosMasterMain } from "axios-master";
import { AxiosResponse } from "axios";

type ApiResponse<T> = {
  code: string;
  success: boolean;
  message: string;
  token?: string;
  data: T;
};

export const ShowToast = async (body: {
  user_id: number;
  type: "info" | "warning";
  text: string;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/socket/notification/toast`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "socket toast",
        timeout: 20000,
        retryFunction: getToken,
        shouldRetry: true,
        shouldRetryStatus: [401, 400],
        logger(data) {
          if (config.logger) {
            console.log(data.json);
          }
        },
      },
    );

    return { success: true, data: result.data, message: result.message };
  } catch (error) {
    const axiosError = error as AxiosResponse<ApiResponse<{}>>;
    if (axiosError.data) {
      console.log(axiosError.data);
    } else {
      console.error("Request Failed:", axiosError);
    }
    return {
      success: false,
      data: null,
      message: axiosError.data?.message || "",
    };
  }
};

export const ShowStatus = async (body: {
  user_id: number;
  id: string;
  type?: "Loading" | "Success" | "Failure";
  title?: string;
  amount?: number | string;
  desc?: string;
  footer?: {
    text: string;
    buttons: {
      text: string;
      fun: "href" | "close" | "exit";
      href?: string | null;
    }[];
  };
  show?: boolean;
  expired_date?: Date;
  start_date?: Date;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        url: `${config.hosts.MAIN}/main/v1/socket/notification/status`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "socket status",
        timeout: 20000,
        retryFunction: getToken,
        shouldRetry: true,
        shouldRetryStatus: [401, 400],
        logger(data) {
          if (config.logger) {
            console.log(data.json);
          }
        },
      },
    );

    return { success: true, data: result.data, message: result.message };
  } catch (error) {
    const axiosError = error as AxiosResponse<ApiResponse<{}>>;
    if (axiosError.data) {
      console.log(axiosError.data);
    } else {
      console.error("Request Failed:", axiosError);
    }
    return {
      success: false,
      data: null,
      message: axiosError.data?.message || "",
    };
  }
};

export const ShowOrderStatus = async (body: {
  user_id: number;
  order_id: string;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        url: `${config.hosts.MAIN}/main/v1/socket/notification/order/status`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "socket order status",
        timeout: 20000,
        retryFunction: getToken,
        shouldRetry: true,
        shouldRetryStatus: [401, 400],
        logger(data) {
          if (config.logger) {
            console.log(data.json);
          }
        },
      },
    );

    return { success: true, data: result.data, message: result.message };
  } catch (error) {
    const axiosError = error as AxiosResponse<ApiResponse<{}>>;
    if (axiosError.data) {
      console.log(axiosError.data);
    } else {
      console.error("Request Failed:", axiosError);
    }
    return {
      success: false,
      data: null,
      message: axiosError.data?.message || "",
    };
  }
};

export default { ShowToast, ShowStatus, ShowOrderStatus };

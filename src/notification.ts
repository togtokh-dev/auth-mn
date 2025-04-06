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
type SinglePushNotiT = {
  user_id: number;
  target_app: "AVDAR-STORE" | "AUTH-APP";
  body: {
    title: string;
    body: string;
    icon: string;
    image?: string;
    button?: {
      title: string;
      url: string;
    } | null;
  };
};
type MailT = {
  type: "notification" | "otp" | "custom";
  form?: {
    name?: string;
    email?: string;
  };
  to: string[];
  subject: string;
  body: {
    name: string;
    title?: string;
    desc?: string;
    otp?: string | number;
    button?: {
      text: string;
      url: string | null;
    };
    footer_text?: string;
  };
};
export const SinglePushNoti = async (
  body: SinglePushNotiT,
): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/notification/single-push`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "notification single-push",
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
export const SMS = async (body: {
  text: string;
  to: string;
  from: string;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/notification/sms`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "notification sms",
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
export const MAIL = async (
  body: MailT,
): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/notification/mail`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "notification mail",
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
export const _3RD_TOKI_NOTI = async (body: {
  accountId: string;
  title: string;
  body: string;
  url: string;
  buttonName: string;
  imageURL?: string;
  icon: string;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/notification/3rd/toki-app`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "notification 3rd toki",
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
export const _3RD_TOKI_HIPAY = async (body: {
  customerId: string;
  message: string;
}): Promise<{ success: boolean; data: null; message: string }> => {
  try {
    const result: ApiResponse<null> = await axiosMasterMain(
      {
        method: "POST",
        maxBodyLength: Infinity,
        url: `${config.hosts.MAIN}/main/v1/notification/3rd/hipay-app`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        data: body,
      },
      {
        name: "notification 3rd hipay",
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
export default {
  SinglePushNoti,
  SMS,
  MAIL,
  _3RD: {
    TOKI: _3RD_TOKI_NOTI,
    HIPAY: _3RD_TOKI_HIPAY,
  },
};

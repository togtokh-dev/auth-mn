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

export default { SinglePushNoti };

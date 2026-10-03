import { request } from "./request";
import { MailT, PushNotiT, Result, SmsT } from "./types";

/** Push мэдэгдэл — permission: notification.push */
export const push = (body: PushNotiT): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/notification/single-push", name: "notification push", data: body });

/** SMS — permission: notification.sms */
export const sms = (body: SmsT): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/notification/sms", name: "notification sms", data: body });

/** Имэйл — permission: notification.mail */
export const mail = (body: MailT): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/notification/mail", name: "notification mail", data: body });

// Хуучин нэрүүд (0.x) — хэвээр ажиллана
export const SinglePushNoti = push;
export const SMS = sms;
export const MAIL = mail;

export default { push, sms, mail, SinglePushNoti, SMS, MAIL };

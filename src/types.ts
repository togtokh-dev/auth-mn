/* -----------------------------
 * Auth.mn API хариуны бүтэц
 * ----------------------------- */
export type ApiResponse<T> = {
  code: string;
  success: boolean;
  message: string;
  token?: string;
  data: T;
};

/** Lib-ийн бүх функц ийм бүтэцтэй буцна — хэзээ ч throw хийхгүй */
export type Result<T> = {
  success: boolean;
  message: string;
  data: T | null;
  /** HTTP status (сүлжээний алдаа бол 0) */
  status?: number;
};

/* -----------------------------
 * Client (project) token
 * ----------------------------- */
export type TokenData = {
  token_type: "Bearer";
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  client_id: string;
  name: string;
  permissions: string[];
};

/** user.verify хариу */
export type VerifiedUser = {
  user: UserT;
  /** token-ийн дуусах хугацаа (unix sec) */
  exp: number | null;
  client: { client_id: string; name: string };
};

export type ClientInfo = {
  client_id: string;
  name: string;
  description?: string;
  domain?: string;
  logo?: string;
  owner_email?: string;
  permissions: string[];
  token_expires_in: string;
  refresh_expires_in: string;
  active: boolean;
  last_used_at?: string | null;
  createdAt?: string;
};

export type PermissionGroup = {
  key: string;
  label: string;
  permissions: { key: string; label: string; desc: string }[];
};

/* -----------------------------
 * User
 * ----------------------------- */
export const genders = ["MEN", "WOMEN"] as const;
export type Gender = (typeof genders)[number];

export interface UserEmailItem {
  email: string;
  verified: boolean;
  primary: boolean;
}
export interface UserPhoneItem {
  number: string;
  verified: boolean;
  primary: boolean;
}
export interface UserAuthProfiles {
  facebook_id?: string | null;
  google_id?: string | null;
  steam_id?: string | null;
  apple_id?: string | null;
  twitter_id?: string | null;
  monpay_id?: string | null;
  toki_id?: string | null;
  social_id?: string | null;
  hipay_id?: string | null;
  digi_id?: string | null;
  happy_pay_id?: string | null;
  most_id?: string | null;
}
export interface UserPreferences {
  language: string;
  notifications: boolean;
}
export interface UserStatus {
  is_active: boolean;
  is_banned: boolean;
  verified: boolean;
}
export interface UserVerifyInfo {
  first_name: string;
  last_name: string;
  born_date: string | Date | null;
  national_id: string;
}
export interface UserAppItem {
  app_name: string;
  app_id: string;
  device_id: string;
}
export interface UserWalletItem {
  key_id: string;
  wallet_id: string;
  wallet_key: string;
  wallet_type: string;
  wallet_name: string;
  role: string[];
}

export type UserT = {
  user_id: number;
  user_name: string;
  nick_name: string;
  exp: number;
  primary_email?: string | null;
  primary_phone?: string | null;
  emails: UserEmailItem[];
  phone_numbers: UserPhoneItem[];
  auth_profiles: UserAuthProfiles;
  profile_image_url: string;
  date_of_birth: string | Date | null;
  gender?: Gender;
  sign_up_date: string | Date | null;
  last_login: string | Date | null;
  wallets?: UserWalletItem[];
  preferences?: UserPreferences;
  status?: UserStatus;
  verify_info?: UserVerifyInfo;
  dynamic_info?: Record<string, any>;
  apps?: UserAppItem[];
};

/* -----------------------------
 * Notification
 * ----------------------------- */
export type PushNotiT = {
  user_id: number;
  target_app: string;
  body: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    button?: { title: string; url: string } | null;
    data?: Record<string, string>;
  };
};

export type SmsT = { text: string; to: string; from: string };

export type MailT = {
  type: "notification" | "otp" | "custom";
  form?: { name?: string; email?: string };
  to: string[];
  subject: string;
  body: {
    name: string;
    title?: string;
    desc?: string;
    otp?: string | number;
    button?: { text: string; url: string | null };
    footer_text?: string;
  };
};

/* -----------------------------
 * Socket
 * ----------------------------- */
export type ToastT = { user_id: number; type?: "info" | "warning"; text: string };

export type StatusT = {
  user_id: number;
  id: string;
  type?: "Loading" | "Success" | "Failure";
  title?: string;
  amount?: number | string;
  desc?: string;
  footer?: {
    text: string;
    buttons: { text: string; fun: "href" | "close" | "exit"; href?: string | null }[];
  };
  show?: boolean;
  expired_date?: Date | string;
  start_date?: Date | string;
};

export type OrderStatusT = { user_id: number; order_id: string; [k: string]: any };

export type EmitT = { user_id: number; emit_name: string; data: any };

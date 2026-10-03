import { request } from "./request";
import { EmitT, OrderStatusT, Result, StatusT, ToastT } from "./types";

/** Хэрэглэгчийн нээлттэй апп дээр toast — permission: socket.toast */
export const toast = (body: ToastT): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/socket/notification/toast", name: "socket toast", data: body });

/** Төлөвийн карт (Loading / Success / Failure) — permission: socket.status */
export const status = (body: StatusT): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/socket/notification/status", name: "socket status", data: body });

/** Захиалгын төлөв шинэчлэгдсэн event — permission: socket.status */
export const orderStatus = (body: OrderStatusT): Promise<Result<null>> =>
  request<null>({
    method: "POST",
    path: "/main/v1/socket/notification/order/status",
    name: "socket order status",
    data: body
  });

/** Дурын event олон хэрэглэгч рүү — permission: socket.emit */
export const emit = (body: EmitT[]): Promise<Result<null>> =>
  request<null>({ method: "POST", path: "/main/v1/socket/emit", name: "socket emit", data: body });

// Хуучин нэрүүд (0.x)
export const ShowToast = toast;
export const ShowStatus = status;
export const ShowOrderStatus = orderStatus;
export const EMIT = emit;

export default { toast, status, orderStatus, emit, ShowToast, ShowStatus, ShowOrderStatus, EMIT };

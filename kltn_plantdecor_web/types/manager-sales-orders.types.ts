import type { PaginatedPayload } from '@/types/manager-store-catalog.types';

export type ManagerNurseryOrderStatus =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;

export interface ManagerNurseryOrderItem {
  id: number;
  itemName: string;
  imageUrl: string | null;
  quantity: number;
  price: number;
  status: number;
  statusName: string;
}

export interface ManagerNurseryOrder {
  id: number;
  orderId: number;
  nurseryId: number;
  nurseryName: string;
  shipperId: number | null;
  shipperName: string | null;
  shipperEmail: string | null;
  shipperPhone: string | null;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  subTotalAmount: number;
  totalAmount?: number | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;
  /**
   * API field name is not finalized; UI will also tolerate `paidAmount` / `amountPaid`.
   */
  paymentAmount?: number | null;
  paidAmount?: number | null;
  amountPaid?: number | null;
  status: number;
  statusName: string;
  shipperNote: string | null;
  deliveryNote: string | null;
  deliveryImageUrl?: string | null;
  customerNotReceivedReason?: string | null;
  note: string;
  items: ManagerNurseryOrderItem[];
}

export type ManagerNurseryOrderDetail = ManagerNurseryOrder;
export type ManagerNurseryOrderListPayload = PaginatedPayload<ManagerNurseryOrder>;

export interface ManagerNurseryOrderShipper {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  totalOrdersInDay: number;
}

export interface ManagerNurseryOrdersListQuery {
  status?: ManagerNurseryOrderStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface RefundNurseryOrderRequest {
  refundedAmount: number;
  refundReference?: string;
  managerRefundNote?: string;
}

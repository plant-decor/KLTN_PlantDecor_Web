import type { NurseryOrder, OrderInvoice, OrderItem } from '@/types/order.types';

/** Đơn hàng trong danh sách / chi tiết consultant — khớp GET/POST consultant orders */
export interface ConsultantOrder {
  id: number;
  userId: number;
  address: string;
  phone: string;
  customerName: string | null;
  customerEmail: string | null;
  totalAmount: number;
  depositAmount: number | null;
  remainingAmount: number | null;
  status: number;
  statusName: string;
  paymentStrategy: number;
  orderType: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  nurseryOrders: NurseryOrder[];
  invoices: OrderInvoice[];
}

/**
 * Input search consultant — `buildConsultantOrderSearchBody` loại các field int filter
 * có giá trị 0 khỏi JSON gửi đi; `pagination` + `sortBy`/`sortDirection` luôn được gửi.
 */
export interface ConsultantOrderSearchRequest {
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  status?: number;
  orderType?: number;
  paymentStrategy?: number;
  createdFrom?: string;
  createdTo?: string;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  customerEmail?: string;
  sortBy: string;
  sortDirection: string;
}

export interface ConsultantOrderSearchPayload {
  items: ConsultantOrder[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

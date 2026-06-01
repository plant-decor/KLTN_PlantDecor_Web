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
  paymentStrategyName: string;
  orderType: number;
  orderTypeName: string;
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

/** Form filter (draft) trước khi bấm Apply */
export interface ConsultantOrderFilterDraft {
  email: string;
  status: number;
  orderType: number;
  payment: number;
  createdFrom: string;
  createdTo: string;
  minAmount: string;
  maxAmount: string;
}

/** Filter đã Apply — map sang body search */
export interface ConsultantOrderFilterApplied {
  email: string;
  status: number;
  orderType: number;
  payment: number;
  createdFrom: string;
  createdTo: string;
  minTotal: number;
  maxTotal: number;
}

export const INITIAL_CONSULTANT_ORDER_FILTER_DRAFT: ConsultantOrderFilterDraft = {
  email: '',
  status: 0,
  orderType: 0,
  payment: 0,
  createdFrom: '',
  createdTo: '',
  minAmount: '',
  maxAmount: '',
};

export const INITIAL_CONSULTANT_ORDER_FILTER_APPLIED: ConsultantOrderFilterApplied = {
  email: '',
  status: 0,
  orderType: 0,
  payment: 0,
  createdFrom: '',
  createdTo: '',
  minTotal: 0,
  maxTotal: 0,
};

export interface ApiResponseWithPayload<T> {
  success: boolean;
  statusCode: number;
  message: string;
  payload: T;
}

export interface OrderItemFallbackRequest {
  commonPlantId?: number;
  plantInstanceId?: number;
  nurseryPlantComboId?: number;
  nurseryMaterialId?: number;
  quantity: number;
  price: number;
}

interface OrderCreateRequestBase {
  address: string;
  phone: string;
  customerName: string;
  note: string;
  paymentStrategy: number;
  orderType: number;
}

export interface OrderCreateRequestWithCartIds extends OrderCreateRequestBase {
  cartItemIds: number[];
  plantInstanceId?: number | null;
}

export interface OrderCreateRequestWithItems extends OrderCreateRequestBase {
  items: OrderItemFallbackRequest[];
}

export type OrderCreateRequest =
  | OrderCreateRequestWithCartIds
  | OrderCreateRequestWithItems;

export interface OrderInvoiceDetail {
  id: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface OrderInvoice {
  id: number;
  orderId: number;
  issuedDate: string;
  totalAmount: number;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  details: OrderInvoiceDetail[];
}

export interface OrderCreatePayload {
  id: number;
  userId: number;
  nurseryId: number | null;
  address: string;
  phone: string;
  customerName: string;
  totalAmount: number;
  depositAmount: number | null;
  remainingAmount: number | null;
  status: number;
  statusName: string;
  paymentStrategy: number;
  orderType: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    itemName: string;
    quantity: number;
    price: number;
    status: number;
    statusName: string;
  }>;
  invoices?: OrderInvoice[];
}

export type CreateOrderResponse = ApiResponseWithPayload<OrderCreatePayload>;

export type InvoiceByOrderResponse = ApiResponseWithPayload<OrderInvoice[]>;

export interface PaymentCreatePayload {
  paymentId: number;
  paymentUrl: string;
}

export type PaymentCreateResponse = ApiResponseWithPayload<PaymentCreatePayload>;

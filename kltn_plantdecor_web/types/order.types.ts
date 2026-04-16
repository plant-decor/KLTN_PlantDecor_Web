export interface ApiResponseWithPayload<T> {
  success: boolean;
  statusCode: number;
  message: string;
  payload: T;
}

export type OrderStatusName =
  | 'Pending'
  | 'DepositPaid'
  | 'Paid'
  | 'Assigned'
  | 'Shipping'
  | 'Delivered'
  | 'RemainingPaymentPending'
  | 'Completed'
  | 'Cancelled'
  | 'Failed'
  | 'RefundRequested'
  | 'Refunded'
  | 'Rejected'
  | 'PendingConfirmation';

export type BuyNowItemType = 1 | 2 | 3;

interface OrderCreateBaseRequest {
  address: string;
  phone: string;
  customerName: string;
  note: string;
  paymentStrategy: number;
  orderType: number;
}

export interface CartOrderCreateRequest extends OrderCreateBaseRequest {
  orderType: 1;
  cartItemIds: number[];
  plantInstanceId?: never;
  buyNowItemId?: never;
  buyNowItemType?: never;
  buyNowQuantity?: never;
}

export interface PlantInstanceOrderCreateRequest extends OrderCreateBaseRequest {
  orderType: 2;
  plantInstanceId: number;
  cartItemIds?: never;
  buyNowItemId?: never;
  buyNowItemType?: never;
  buyNowQuantity?: never;
}

export interface BuyNowOrderCreateRequest extends OrderCreateBaseRequest {
  orderType: 3;
  buyNowItemId: number;
  buyNowItemType: BuyNowItemType;
  buyNowQuantity: number;
  cartItemIds?: never;
  plantInstanceId?: never;
}

export type OrderCreateRequest =
  | CartOrderCreateRequest
  | PlantInstanceOrderCreateRequest
  | BuyNowOrderCreateRequest;

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

export interface OrderItem {
  id: number;
  itemName: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  status: number;
  statusName: string;
}

export interface NurseryOrder {
  id: number;
  nurseryId: number;
  nurseryName: string;
  shipperId: number | null;
  shipperName: string | null;
  subTotalAmount: number;
  status: number;
  statusName: string;
  shipperNote: string | null;
  items: OrderItem[];
}

export interface Order {
  id: number;
  userId: number;
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
  items: OrderItem[];
  nurseryOrders: NurseryOrder[];
  invoices: OrderInvoice[];
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
  items: OrderItem[];
  invoices?: OrderInvoice[];
}

export type CreateOrderResponse = ApiResponseWithPayload<OrderCreatePayload>;

export type InvoiceByOrderResponse = ApiResponseWithPayload<OrderInvoice[]>;
export type PendingInvoicesResponse = ApiResponseWithPayload<OrderInvoice[]>;
export type MyOrdersResponse = ApiResponseWithPayload<Order[]>;
export type MyOrderDetailResponse = ApiResponseWithPayload<Order>;

export interface PaymentCreatePayload {
  paymentId: number;
  paymentUrl: string;
}

export type PaymentCreateResponse = ApiResponseWithPayload<PaymentCreatePayload>;
export type ContinuePaymentResponse = ApiResponseWithPayload<PaymentCreatePayload>;

import { get, post } from '@/lib/api/apiService';
import type {
  CreateOrderResponse,
  InvoiceByOrderResponse,
  MyOrderDetailResponse,
  MyOrdersResponse,
  Order,
  OrderCreatePayload,
  OrderCreateRequest,
  OrderInvoice,
  PaymentCreateResponse,
} from '@/types/order.types';

const ORDER_ENDPOINT = '/Order';
const INVOICE_BY_ORDER_ENDPOINT = '/Invoice/order';
const PAYMENT_CREATE_ENDPOINT = '/Payment/create';

type ApiResponseFallback<T> = Partial<{
  payload: T;
  data: T;
}>;

function getPayloadFromResponse<T>(response: ApiResponseFallback<T>): T | undefined {
  return response.payload ?? response.data;
}

export async function createOrder(
  payload: OrderCreateRequest
): Promise<OrderCreatePayload> {
  const response = await post<CreateOrderResponse>(
    ORDER_ENDPOINT,
    payload,
    false,
    false
  );
  return response.payload;
}

export async function getInvoicesByOrderId(
  orderId: number
): Promise<OrderInvoice[]> {
  const response = await get<InvoiceByOrderResponse>(
    `${INVOICE_BY_ORDER_ENDPOINT}/${orderId}`,
    undefined,
    false,
    false
  );
  return response.payload ?? [];
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await get<MyOrdersResponse & ApiResponseFallback<Order[]>>(
    `${ORDER_ENDPOINT}/my`,
    undefined,
    false,
    false
  );
  return getPayloadFromResponse(response) ?? [];
}

export async function getMyOrderById(orderId: number): Promise<Order | null> {
  const response = await get<MyOrderDetailResponse & ApiResponseFallback<Order>>(
    `${ORDER_ENDPOINT}/${orderId}`,
    undefined,
    false,
    false
  );
  return getPayloadFromResponse(response) ?? null;
}

export async function createPaymentUrl(invoiceId: number): Promise<string> {
  const response = await post<PaymentCreateResponse>(
    PAYMENT_CREATE_ENDPOINT,
    { invoiceId },
    false,
    false
  );
  return response.payload.paymentUrl;
}

import { get, patch, post } from '@/lib/api/apiService';
import type {
  ContinuePaymentResponse,
  CreateOrderResponse,
  InvoiceByOrderResponse,
  MyOrderDetailResponse,
  MyOrdersResponse,
  Order,
  OrderCreatePayload,
  OrderCreateRequest,
  OrderInvoice,
  PaymentCreateResponse,
  OrderStatusName,
} from '@/types/order.types';

const ORDER_ENDPOINT = '/Order';
const INVOICE_BY_ORDER_ENDPOINT = '/Invoice/order';
const PAYMENT_ENDPOINT = '/Payment';

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

export async function getMyOrders(orderStatus?: OrderStatusName): Promise<Order[]> {
  const params = orderStatus ? { orderStatus } : undefined;
  const response = await get<MyOrdersResponse & ApiResponseFallback<Order[]>>(
    `${ORDER_ENDPOINT}/my`,
    params,
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
    `${PAYMENT_ENDPOINT}/create`,
    { invoiceId },
    false,
    false
  );
  return response.payload.paymentUrl;
}

export async function createPaymentUrlByOrderId(orderId: number): Promise<string> {
  const order = await getMyOrderById(orderId);

  if (!order) {
    throw new Error('Cannot load order details for payment');
  }

  const invoiceId = order.invoices?.[0]?.id;
  if (!invoiceId) {
    throw new Error('Cannot find invoice for this order');
  }

  return createPaymentUrl(invoiceId);
}

export async function retryPayment(paymentId: number): Promise<string> {
  const response = await post<PaymentCreateResponse>(
    `${PAYMENT_ENDPOINT}/${paymentId}/retry`,
    {},
    false,
    false
  );
  return response.payload.paymentUrl;
}

export async function continuePaymentByInvoice(invoiceId: number): Promise<string> {
  const response = await post<ContinuePaymentResponse>(
    `${PAYMENT_ENDPOINT}/invoice/${invoiceId}/continue`,
    {},
    false,
    false
  );
  return response.payload.paymentUrl;
}

export async function cancelOrder(orderId: number): Promise<Order> {
  const response = await patch<MyOrderDetailResponse & ApiResponseFallback<Order>>(
    `${ORDER_ENDPOINT}/${orderId}/cancel`,
    {},
    false,
    false
  );
  const payload = getPayloadFromResponse(response);
  if (!payload) {
    throw new Error('Cannot cancel order');
  }
  return payload;
}

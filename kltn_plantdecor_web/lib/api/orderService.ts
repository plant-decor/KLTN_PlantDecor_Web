import { get, post } from '@/lib/api/apiService';
import type {
  CreateOrderResponse,
  InvoiceByOrderResponse,
  OrderCreatePayload,
  OrderCreateRequest,
  OrderInvoice,
  PaymentCreateResponse,
} from '@/types/order.types';

const ORDER_ENDPOINT = '/Order';
const INVOICE_BY_ORDER_ENDPOINT = '/Invoice/order';
const PAYMENT_CREATE_ENDPOINT = '/Payment/create';

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

export async function createPaymentUrl(invoiceId: number): Promise<string> {
  const response = await post<PaymentCreateResponse>(
    PAYMENT_CREATE_ENDPOINT,
    { invoiceId },
    false,
    false
  );
  return response.payload.paymentUrl;
}

export interface AdminLowStockItem {
  nurseryId: number;
  nurseryName: string;
  productType: string;
  productId: number;
  productName: string | null;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  threshold: number;
}

export interface AdminOrderStatusSummaryItem {
  status: number;
  statusName: string;
  totalOrders: number;
}

export interface AdminOrderStatusSummaryPayload {
  from: string;
  to: string;
  items: AdminOrderStatusSummaryItem[];
}

export interface AdminFailedOrdersPayload {
  from: string;
  to: string;
  totalFailedOrders: number;
}

export interface AdminTopProductItem {
  productType: string;
  productId: number;
  productName: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

export interface AdminDashboardDateRangeParams {
  from: string;
  to: string;
}

export interface AdminTopProductsParams extends AdminDashboardDateRangeParams {
  limit: number;
}

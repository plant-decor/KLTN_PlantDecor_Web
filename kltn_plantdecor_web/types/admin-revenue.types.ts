export interface AdminRevenueDateRangeParams {
  from: string;
  to: string;
}

export interface AdminRevenueSummaryPayload {
  from: string;
  to: string;
  totalRevenue: number;
  totalOrders: number;
}

export interface AdminRevenueByNurseryRow {
  nurseryId: number;
  nurseryName: string;
  revenue: number;
  totalOrders: number;
}

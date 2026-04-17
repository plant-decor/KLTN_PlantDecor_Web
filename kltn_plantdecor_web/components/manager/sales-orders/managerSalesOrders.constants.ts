import type { ManagerNurseryOrderStatus } from '@/types/manager-sales-orders.types';

export const ALL_STATUS_FILTER = 'ALL';

export const SALES_ORDER_STATUS_LABELS: Record<ManagerNurseryOrderStatus, string> = {
  0: 'Chờ xử lý',
  1: 'Đã cọc',
  2: 'Đã thanh toán',
  3: 'Đã phân công',
  4: 'Đang giao',
  5: 'Đã giao',
  6: 'Chờ thanh toán còn lại',
  7: 'Hoàn thành',
  8: 'Đã hủy',
  9: 'Thất bại',
  10: 'Yêu cầu hoàn tiền',
  11: 'Đã hoàn tiền',
  12: 'Đã từ chối',
  13: 'Chờ xác nhận',
};

export const SALES_ORDER_STATUS_CHIP_COLOR: Record<
  ManagerNurseryOrderStatus,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'info',
  4: 'warning',
  5: 'success',
  6: 'warning',
  7: 'success',
  8: 'error',
  9: 'error',
  10: 'warning',
  11: 'default',
  12: 'error',
  13: 'info',
};

export const SALES_ORDER_STATUS_OPTIONS: Array<{
  value: typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus;
  label: string;
}> = [
  { value: ALL_STATUS_FILTER, label: 'Tất cả trạng thái' },
  { value: 0, label: SALES_ORDER_STATUS_LABELS[0] },
  { value: 1, label: SALES_ORDER_STATUS_LABELS[1] },
  { value: 2, label: SALES_ORDER_STATUS_LABELS[2] },
  { value: 3, label: SALES_ORDER_STATUS_LABELS[3] },
  { value: 4, label: SALES_ORDER_STATUS_LABELS[4] },
  { value: 5, label: SALES_ORDER_STATUS_LABELS[5] },
  { value: 6, label: SALES_ORDER_STATUS_LABELS[6] },
  { value: 7, label: SALES_ORDER_STATUS_LABELS[7] },
  { value: 8, label: SALES_ORDER_STATUS_LABELS[8] },
  { value: 9, label: SALES_ORDER_STATUS_LABELS[9] },
  { value: 10, label: SALES_ORDER_STATUS_LABELS[10] },
  { value: 11, label: SALES_ORDER_STATUS_LABELS[11] },
  { value: 12, label: SALES_ORDER_STATUS_LABELS[12] },
  { value: 13, label: SALES_ORDER_STATUS_LABELS[13] },
];

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('vi-VN');
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-';
  }

  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export const normalizeMultilineText = (value: string | null | undefined): string => {
  if (!value) {
    return '-';
  }

  return value.replace(/\r\n/g, '\n');
};

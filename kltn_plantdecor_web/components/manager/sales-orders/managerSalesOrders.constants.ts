export const ALL_STATUS_FILTER = -1;

export const SALES_ORDER_STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Deposited',
  2: 'Paid',
  3: 'Assigned',
  4: 'Shipping',
  5: 'Delivered',
  6: 'Awaiting Remaining Payment',
  7: 'Completed',
  8: 'Cancelled',
  9: 'Failed',
  10: 'Refund Requested',
  11: 'Refunded',
  12: 'Rejected',
  13: 'Pending Confirmation',
};

export const SALES_ORDER_STATUS_CHIP_COLOR: Record<number, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'info',
  4: 'info',
  5: 'success',
  6: 'warning',
  7: 'success',
  8: 'error',
  9: 'error',
  10: 'warning',
  11: 'success',
  12: 'error',
  13: 'warning',
};

export const SALES_ORDER_STATUS_OPTIONS = [
  { value: ALL_STATUS_FILTER, label: 'All statuses' },
  ...Object.entries(SALES_ORDER_STATUS_LABELS).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
];

export const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-';
  }

  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const normalizeMultilineText = (value?: string | null) => {
  if (!value || typeof value !== 'string') {
    return '-';
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
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

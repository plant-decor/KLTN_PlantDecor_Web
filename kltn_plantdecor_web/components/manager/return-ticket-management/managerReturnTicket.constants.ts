import type { ChipProps } from '@mui/material';

export const ALL_ASSIGNMENT_STATUS_FILTER = -1;

export const RETURN_TICKET_ASSIGNMENT_STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'In Review',
  2: 'Completed',
};

export const RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'success',
};

export const RETURN_TICKET_ITEM_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'error',
  3: 'success',
};

export const RETURN_TICKET_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'error',
  5: 'success',
};

export const RETURN_TICKET_ASSIGNMENT_STATUS_OPTIONS = [
  { value: ALL_ASSIGNMENT_STATUS_FILTER, label: 'All statuses' },
  ...Object.entries(RETURN_TICKET_ASSIGNMENT_STATUS_LABELS).map(([value, label]) => ({
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

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('vi-VN');
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

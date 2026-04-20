import type { EnumOption } from '@/types/care-service.types';

export const ALL_STATUS_FILTER = 'ALL';

export type ServiceStatusFilterValue = typeof ALL_STATUS_FILTER | number;

export interface ServiceStatusOption {
  value: ServiceStatusFilterValue;
  label: string;
}

export const formatStatusEnumLabel = (value: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const STATUS_CHIP_COLOR: Partial<Record<number, 'default' | 'warning' | 'success' | 'error' | 'info'>> = {
  0: 'warning',
  1: 'warning',
  2: 'info',
  3: 'success',
  4: 'default',
  5: 'error',
  6: 'error',
};

export const getStatusChipColor = (status: number) => STATUS_CHIP_COLOR[status] || 'default';

export const buildServiceStatusOptions = (enums: EnumOption[]): ServiceStatusOption[] => {
  return [{ value: ALL_STATUS_FILTER, label: 'All Statuses' }, ...enums.map((item) => ({ value: item.value, label: formatStatusEnumLabel(item.name) }))];
};

export const buildServiceStatusLabelMap = (enums: EnumOption[]) => {
  return enums.reduce<Record<number, string>>((accumulator, item) => {
    accumulator[item.value] = formatStatusEnumLabel(item.name);
    return accumulator;
  }, {});
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('vi-VN');
};

export const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-';
  }

  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export const canApproveOrReject = (status: number) => status === 1 || status === 0;
export const canAssignCaretaker = (status: number) => status === 2 || status === 3;
export const canManagerCancel = (status: number) => status === 3;

import type { ServiceRegistrationStatusEnum } from '@/types/care-service.types';

export const ALL_STATUS_FILTER = 'ALL';

export const STATUS_LABELS: Record<ServiceRegistrationStatusEnum, string> = {
  1: 'Chờ duyệt',
  2: 'Chờ thanh toán',
  3: 'Đang hoạt động',
  4: 'Hoàn thành',
  5: 'Đã hủy',
  6: 'Đã từ chối',
};

export const STATUS_CHIP_COLOR: Record<
  ServiceRegistrationStatusEnum,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  1: 'warning',
  2: 'info',
  3: 'success',
  4: 'default',
  5: 'error',
  6: 'error',
};

export const SERVICE_STATUS_OPTIONS: Array<{
  value: typeof ALL_STATUS_FILTER | ServiceRegistrationStatusEnum;
  label: string;
}> = [
  { value: ALL_STATUS_FILTER, label: 'Tất cả trạng thái' },
  { value: 1, label: STATUS_LABELS[1] },
  { value: 2, label: STATUS_LABELS[2] },
  { value: 3, label: STATUS_LABELS[3] },
  { value: 4, label: STATUS_LABELS[4] },
  { value: 5, label: STATUS_LABELS[5] },
  { value: 6, label: STATUS_LABELS[6] },
];

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

export const canApproveOrReject = (status: number) => status === 1;
export const canAssignCaretaker = (status: number) => status === 2 || status === 3;
export const canManagerCancel = (status: number) => status === 3;

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PaymentsIcon from '@mui/icons-material/Payments';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ReplayIcon from '@mui/icons-material/Replay';
import type { ReactElement } from 'react';
import type { ChipProps } from '@mui/material/Chip';
import { formatDateTime } from '@/lib/utils/dateUtils';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function formatDate(dateStr: string): string {
  return formatDateTime(dateStr);
}

export function canUserCancelOrder(statusName: string): boolean {
  return statusName === 'Pending';
}

export function getStatusInfo(statusName: string): {
  color: ChipProps['color'];
  icon: ReactElement;
} {
  switch (statusName) {
    case 'Pending':
      return { color: 'warning', icon: <ShoppingCartIcon /> };
    case 'DepositPaid':
    case 'Paid':
    case 'Assigned':
      return { color: 'info', icon: <CheckCircleIcon /> };
    case 'Shipping':
      return { color: 'primary', icon: <LocalShippingIcon /> };
    case 'PendingConfirmation':
      return { color: 'primary', icon: <HourglassTopIcon /> };
    case 'Delivered':
      return { color: 'success', icon: <LocalShippingIcon /> };
    case 'RemainingPaymentPending':
      return { color: 'warning', icon: <PaymentsIcon /> };
    case 'Completed':
      return { color: 'success', icon: <CheckCircleIcon /> };
    case 'RefundRequested':
      return { color: 'warning', icon: <ReplayIcon /> };
    case 'Refunded':
      return { color: 'success', icon: <ReplayIcon /> };
    case 'Failed':
    case 'Rejected':
      return { color: 'error', icon: <ErrorOutlineIcon /> };
    case 'Cancelled':
      return { color: 'error', icon: <CancelIcon /> };
    default:
      return { color: 'default', icon: <ShoppingCartIcon /> };
  }
}

export function getOrderSteps(statusName: string): { steps: string[]; activeStep: number } {
  if (statusName === 'Cancelled') {
    return { steps: ['Ordered', 'Cancelled'], activeStep: 1 };
  }

  if (statusName === 'Failed') {
    return { steps: ['Ordered', 'Failed'], activeStep: 1 };
  }

  if (statusName === 'Rejected') {
    return { steps: ['Ordered', 'Refund Requested', 'Rejected'], activeStep: 2 };
  }

  if (statusName === 'Refunded') {
    return { steps: ['Ordered', 'Completed', 'Refunded'], activeStep: 2 };
  }

  const steps = ['Ordered', 'Processing', 'Shipping', 'Delivered', 'Completed'];
  const statusMap: Record<string, number> = {
    Pending: 0,
    DepositPaid: 1,
    Paid: 1,
    Assigned: 1,
    Shipping: 2,
    Delivered: 3,
    PendingConfirmation: 3,
    RemainingPaymentPending: 3,
    Completed: 4,
    RefundRequested: 4,
  };

  return { steps, activeStep: statusMap[statusName] ?? 0 };
}

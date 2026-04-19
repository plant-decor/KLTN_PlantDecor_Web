import type { ChipProps } from '@mui/material';

export const RETURN_TICKET_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'error',
  5: 'success',
};

export const RETURN_TICKET_ITEM_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'error',
  3: 'success',
};

export const RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR: Record<number, ChipProps['color']> = {
  0: 'warning',
  1: 'info',
  2: 'success',
};

export const canCreateReturnTicket = (orderStatusName?: string) => {
  return orderStatusName === 'PendingConfirmation';
};

export const isPendingNurseryOrderDetail = (statusName?: string) => {
  return statusName === 'Pending';
};

import type { DesignRegistrationTask } from '@/types/design-registration.types';
import {
  DESIGN_STATUS,
  DESIGN_TASK_STATUS,
  FINAL_DESIGN_STATUSES,
} from './designStatusConstants';

export const getDesignStatusChipColor = (
  status: number
): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  if (status === DESIGN_STATUS.PendingApproval) return 'warning';
  if (status === DESIGN_STATUS.AwaitDeposit || status === DESIGN_STATUS.AwaitFinalPayment) return 'info';
  if (
    status === DESIGN_STATUS.DepositPaid ||
    status === DESIGN_STATUS.InProgress ||
    status === DESIGN_STATUS.Completed
  )
    return 'success';
  if (status === DESIGN_STATUS.Rejected || status === DESIGN_STATUS.Cancelled) return 'error';
  return 'default';
};

export const canApproveDesign = (status: number): boolean => status === DESIGN_STATUS.PendingApproval;

export const canRejectDesign = (status: number): boolean =>
  status === DESIGN_STATUS.PendingApproval || status === DESIGN_STATUS.AwaitDeposit;

export const canManagerCancelDesign = (status: number): boolean =>
  !FINAL_DESIGN_STATUSES.has(status) &&
  status !== DESIGN_STATUS.PendingApproval &&
  status !== DESIGN_STATUS.AwaitDeposit;

export const canAssignCaretakerToDesign = (status: number): boolean =>
  status === DESIGN_STATUS.DepositPaid;

export const canAssignDesignTask = (task: DesignRegistrationTask): boolean =>
  task.status !== DESIGN_TASK_STATUS.Completed && task.status !== DESIGN_TASK_STATUS.Cancelled;

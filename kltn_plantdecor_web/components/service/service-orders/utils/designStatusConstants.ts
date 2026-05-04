export const DESIGN_STATUS = {
  PendingApproval: 1,
  AwaitDeposit: 2,
  DepositPaid: 3,
  InProgress: 4,
  AwaitFinalPayment: 5,
  Completed: 6,
  Rejected: 7,
  Cancelled: 8,
} as const;

export const DESIGN_TASK_STATUS = {
  Completed: 3,
  Cancelled: 4,
} as const;

export const FINAL_DESIGN_STATUSES = new Set<number>([
  DESIGN_STATUS.Completed,
  DESIGN_STATUS.Rejected,
  DESIGN_STATUS.Cancelled,
]);

import type { PaginatedPayload } from '@/types/manager-store-catalog.types';

export type ReturnTicketStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type ReturnTicketItemStatus = 0 | 1 | 2 | 3;
export type ReturnTicketAssignmentStatus = 0 | 1 | 2;

export interface EnumOption {
  value: number;
  name: string;
}

export interface ReturnTicketEnumGroup {
  enumName: string;
  values: EnumOption[];
}

export interface ReturnTicketItem {
  id: number;
  productImageUrl: string | null;
  nurseryOrderDetailId: number;
  itemName: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
  reason: string;
  managerDecisionNote: string | null;
  refundedAmount: number | null;
  refundReference: string | null;
  refundedAt: string | null;
  status: ReturnTicketItemStatus;
  statusName: string;
  nurseryOrderId: number;
  nurseryId: number;
  imageUrls: string[];
}

export interface ReturnTicketAssignment {
  id: number;
  nurseryId: number;
  managerId: number;
  managerName: string;
  status: ReturnTicketAssignmentStatus;
  statusName: string;
  assignedAt: string;
}

export interface ReturnTicket {
  id: number;
  orderId: number;
  customerId: number;
  reason: string;
  status: ReturnTicketStatus;
  statusName: string;
  totalRefundedAmount: number;
  createdAt: string;
  items: ReturnTicketItem[];
  assignments: ReturnTicketAssignment[];
}

export interface CreateReturnTicketItemRequest {
  nurseryOrderDetailId: number;
  requestedQuantity: number;
  reason: string;
}

export interface CreateReturnTicketRequest {
  orderId: number;
  reason: string;
  items: CreateReturnTicketItemRequest[];
}

export interface ManagerReturnTicketAssignmentItemActionRequest {
  note: string;
}

export interface ManagerReturnTicketAssignmentItemApproveRequest extends ManagerReturnTicketAssignmentItemActionRequest {
  approvedQuantity: number;
}

export type ManagerReturnTicketAssignmentItemRefundRequest = Record<string, unknown>;

export type ManagerReturnTicketAssignmentItem = ReturnTicketItem;

export interface ManagerReturnTicketAssignmentListItem {
  assignmentId: number;
  returnTicketId: number;
  nurseryId: number;
  nurseryName: string;
  managerId: number;
  managerName: string;
  assignmentStatus: ReturnTicketAssignmentStatus;
  assignmentStatusName: string;
  assignedAt: string;
  orderId: number;
  customerId: number;
  customerName: string;
  ticketReason: string;
  ticketStatus: ReturnTicketStatus;
  ticketStatusName: string;
  ticketTotalRefundedAmount: number;
  items: ManagerReturnTicketAssignmentItem[];
}

export type ManagerReturnTicketAssignmentDetail = ManagerReturnTicketAssignmentListItem;

export type ManagerReturnTicketAssignmentListPayload =
  | PaginatedPayload<ManagerReturnTicketAssignmentListItem>
  | ManagerReturnTicketAssignmentListItem[];

export interface ManagerReturnTicketAssignmentListQuery {
  status?: ReturnTicketAssignmentStatus;
  pageNumber?: number;
  pageSize?: number;
}

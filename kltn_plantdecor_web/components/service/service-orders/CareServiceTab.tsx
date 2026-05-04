'use client';

import { Alert, Box, Paper, TableContainer, Typography } from '@mui/material';
import ServiceOrdersHeader from './ServiceOrdersHeader';
import ServiceOrdersTable from './ServiceOrdersTable';
import ServiceOrderDetailDialog from './ServiceOrderDetailDialog';
import ServiceOrderApproveDialog from './ServiceOrderApproveDialog';
import ServiceOrderRejectDialog from './ServiceOrderRejectDialog';
import ServiceOrderCancelDialog from './ServiceOrderCancelDialog';
import ServiceOrderAssignDialog from './ServiceOrderAssignDialog';
import ServiceOrderRescheduleDialog, { type ServiceOrderRescheduleValues } from './ServiceOrderRescheduleDialog';
import type { EligibleCaretaker, ManagerServiceRegistration, PublicShift } from '@/types/care-service.types';
import type { ServiceStatusOption, ServiceStatusFilterValue } from './managerServiceOrders.constants';

interface CareServiceTabProps {
  items: ManagerServiceRegistration[];
  loading: boolean;
  error: string | null;
  statusFilter: ServiceStatusFilterValue;
  statusOptions: ServiceStatusOption[];
  activeFilterLabel: string;
  statusLabelMap: Record<number, string>;
  stats: {
    pending: number;
    awaitingPayment: number;
    active: number;
  };
  submitting: boolean;
  detailOpen: boolean;
  detailLoading: boolean;
  detailItem: ManagerServiceRegistration | null;
  approveTarget: ManagerServiceRegistration | null;
  rejectTarget: ManagerServiceRegistration | null;
  rejectReason: string;
  cancelTarget: ManagerServiceRegistration | null;
  cancelReason: string;
  assignTarget: ManagerServiceRegistration | null;
  eligibleCaretakers: EligibleCaretaker[];
  assignLoading: boolean;
  selectedCaretakerId: number;
  rescheduleTarget: ManagerServiceRegistration | null;
  publicShifts: PublicShift[];
  shiftsLoading: boolean;
  onStatusFilterChange: (value: ServiceStatusFilterValue) => void;
  onRefresh: () => void;
  onViewDetail: (id: number) => void;
  onApprove: (item: ManagerServiceRegistration) => void;
  onReject: (item: ManagerServiceRegistration) => void;
  onCancel: (item: ManagerServiceRegistration) => void;
  onAssignCaretaker: (item: ManagerServiceRegistration) => void;
  onReschedule: (item: ManagerServiceRegistration) => void;
  onCloseDetail: () => void;
  onApproveConfirm: () => void;
  onCloseApprove: () => void;
  onRejectReasonChange: (value: string) => void;
  onConfirmReject: () => void;
  onCloseReject: () => void;
  onCancelReasonChange: (value: string) => void;
  onConfirmCancel: () => void;
  onCloseCancel: () => void;
  onSelectedCaretakerIdChange: (value: number) => void;
  onConfirmAssign: () => void;
  onCloseAssign: () => void;
  onConfirmReschedule: (values: ServiceOrderRescheduleValues) => void;
  onCloseReschedule: () => void;
  onCloseError: () => void;
}

export default function CareServiceTab({
  items,
  loading,
  error,
  statusFilter,
  statusOptions,
  activeFilterLabel,
  stats,
  submitting,
  detailOpen,
  detailLoading,
  detailItem,
  approveTarget,
  rejectTarget,
  rejectReason,
  cancelTarget,
  cancelReason,
  assignTarget,
  eligibleCaretakers,
  assignLoading,
  selectedCaretakerId,
  rescheduleTarget,
  publicShifts,
  shiftsLoading,
  onStatusFilterChange,
  onRefresh,
  onViewDetail,
  onApprove,
  onReject,
  onCancel,
  onAssignCaretaker,
  onReschedule,
  onCloseDetail,
  onApproveConfirm,
  onCloseApprove,
  onRejectReasonChange,
  onConfirmReject,
  onCloseReject,
  onCancelReasonChange,
  onConfirmCancel,
  onCloseCancel,
  onSelectedCaretakerIdChange,
  onConfirmAssign,
  onCloseAssign,
  onConfirmReschedule,
  onCloseReschedule,
  onCloseError,
  statusLabelMap,
}: CareServiceTabProps) {
  return (
    <>
      <ServiceOrdersHeader
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        activeFilterLabel={activeFilterLabel}
        pendingCount={stats.pending}
        awaitingPaymentCount={stats.awaitingPayment}
        activeCount={stats.active}
        loading={loading}
        onStatusFilterChange={onStatusFilterChange}
        onRefresh={onRefresh}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onCloseError}>
          {error}
        </Alert>
      )}

      <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <Typography>Loading service orders...</Typography>
          </Box>
        ) : (
          <TableContainer>
            <ServiceOrdersTable
              items={items}
              statusLabels={statusLabelMap}
              submitting={submitting}
              onViewDetail={onViewDetail}
              onApprove={onApprove}
              onReject={onReject}
              onCancel={onCancel}
              onAssignCaretaker={onAssignCaretaker}
              onReschedule={onReschedule}
            />
          </TableContainer>
        )}
      </Paper>

      <ServiceOrderDetailDialog
        open={detailOpen}
        loading={detailLoading}
        submitting={submitting}
        detailItem={detailItem}
        statusLabels={statusLabelMap}
        onClose={onCloseDetail}
        onApprove={onApprove}
        onReject={onReject}
        onCancel={onCancel}
        onAssignCaretaker={onAssignCaretaker}
        onReschedule={onReschedule}
      />

      <ServiceOrderApproveDialog
        open={Boolean(approveTarget)}
        target={approveTarget}
        submitting={submitting}
        onClose={onCloseApprove}
        onConfirm={onApproveConfirm}
      />

      <ServiceOrderRejectDialog
        open={Boolean(rejectTarget)}
        target={rejectTarget}
        reason={rejectReason}
        submitting={submitting}
        onReasonChange={onRejectReasonChange}
        onClose={onCloseReject}
        onConfirm={onConfirmReject}
      />

      <ServiceOrderCancelDialog
        open={Boolean(cancelTarget)}
        target={cancelTarget}
        reason={cancelReason}
        submitting={submitting}
        onReasonChange={onCancelReasonChange}
        onClose={onCloseCancel}
        onConfirm={onConfirmCancel}
      />

      <ServiceOrderAssignDialog
        open={Boolean(assignTarget)}
        target={assignTarget}
        selectedCaretakerId={selectedCaretakerId}
        eligibleCaretakers={eligibleCaretakers}
        loading={assignLoading}
        submitting={submitting}
        onSelectedCaretakerIdChange={onSelectedCaretakerIdChange}
        onClose={onCloseAssign}
        onConfirm={onConfirmAssign}
      />

      <ServiceOrderRescheduleDialog
        open={Boolean(rescheduleTarget)}
        target={rescheduleTarget}
        shifts={publicShifts}
        shiftsLoading={shiftsLoading}
        submitting={submitting}
        onClose={onCloseReschedule}
        onConfirm={onConfirmReschedule}
      />
    </>
  );
}

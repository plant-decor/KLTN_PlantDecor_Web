'use client';

import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ServiceOrdersHeader from './ServiceOrdersHeader';
import DesignOrderDetailDialog from './dialogs/DesignOrderDetailDialog';
import DesignOrderCancelDialog from './dialogs/DesignOrderCancelDialog';
import DesignOrderRejectDialog from './dialogs/DesignOrderRejectDialog';
import DesignTaskAssignDialog from './dialogs/DesignTaskAssignDialog';
import { canApproveDesign, canManagerCancelDesign, canRejectDesign, getDesignStatusChipColor } from './utils/designStatusUtil';
import { formatCurrency } from '@/lib/utils/formatUtil';
import type { CustomerDesignRegistrationDetail, CustomerDesignRegistrationListItem, DesignEligibleCaretaker, DesignEligibleCaretakerAvailability, DesignRegistrationTask } from '@/types/design-registration.types';
import type { ServiceStatusOption, ServiceStatusFilterValue } from './managerServiceOrders.constants';

interface DesignServiceTabProps {
  designOrders: CustomerDesignRegistrationListItem[];
  designLoading: boolean;
  designError: string | null;
  designStatusFilter: ServiceStatusFilterValue;
  designStatusOptions: ServiceStatusOption[];
  activeDesignFilterLabel: string;
  designStats: {
    pending: number;
    awaitingPayment: number;
    active: number;
  };
  submitting: boolean;
  designDetailOpen: boolean;
  designDetailLoading: boolean;
  designDetailItem: CustomerDesignRegistrationDetail | null;
  designCancelTarget: CustomerDesignRegistrationListItem | null;
  designCancelReason: string;
  designRejectTarget: CustomerDesignRegistrationListItem | null;
  designRejectReason: string;
  designTaskAssignTarget: DesignRegistrationTask | null;
  designTaskAssignRegistration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail | null;
  eligibleDesignCaretakers: DesignEligibleCaretaker[];
  eligibleDesignAvailability: DesignEligibleCaretakerAvailability[];
  designAssignLoading: boolean;
  selectedDesignCaretakerId: number;
  designTaskScheduledDate: string;
  getDesignRegistrationStatusLabel: (item: Pick<CustomerDesignRegistrationListItem, 'status' | 'statusName'>) => string;
  getDesignTaskStatusLabel: (task: DesignRegistrationTask) => string;
  getDesignTaskTypeLabel: (task: DesignRegistrationTask) => string;
  onStatusFilterChange: (value: ServiceStatusFilterValue) => void;
  onRefresh: () => void;
  onViewDetail: (id: number) => void;
  onApprove: (id: number) => void;
  onOpenRejectDialog: (item: CustomerDesignRegistrationListItem) => void;
  onOpenCancelDialog: (item: CustomerDesignRegistrationListItem) => void;
  onOpenTaskAssignDialog: (task: DesignRegistrationTask, registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail) => void;
  onOpenTaskRescheduleDialog: (task: DesignRegistrationTask, registration: CustomerDesignRegistrationListItem | CustomerDesignRegistrationDetail) => void;
  onCloseDetail: () => void;
  onCloseCancel: () => void;
  onCloseReject: () => void;
  onCloseTaskAssign: () => void;
  onConfirmCancel: () => void;
  onConfirmReject: () => void;
  onConfirmAssign: () => void;
  onScheduledDateChange: (value: string) => void;
  onSelectedCaretakerIdChange: (value: number) => void;
  onCancelReasonChange: (value: string) => void;
  onRejectReasonChange: (value: string) => void;
}

export default function DesignServiceTab({
  designOrders,
  designLoading,
  designError,
  designStatusFilter,
  designStatusOptions,
  activeDesignFilterLabel,
  designStats,
  submitting,
  designDetailOpen,
  designDetailLoading,
  designDetailItem,
  designCancelTarget,
  designCancelReason,
  designRejectTarget,
  designRejectReason,
  designTaskAssignTarget,
  designTaskAssignRegistration,
  eligibleDesignCaretakers,
  eligibleDesignAvailability,
  designAssignLoading,
  selectedDesignCaretakerId,
  designTaskScheduledDate,
  getDesignRegistrationStatusLabel,
  getDesignTaskStatusLabel,
  getDesignTaskTypeLabel,
  onStatusFilterChange,
  onRefresh,
  onViewDetail,
  onApprove,
  onOpenRejectDialog,
  onOpenCancelDialog,
  onOpenTaskAssignDialog,
  onOpenTaskRescheduleDialog,
  onCloseDetail,
  onCloseCancel,
  onCloseReject,
  onCloseTaskAssign,
  onConfirmCancel,
  onConfirmReject,
  onConfirmAssign,
  onScheduledDateChange,
  onSelectedCaretakerIdChange,
  onCancelReasonChange,
  onRejectReasonChange,
}: DesignServiceTabProps) {
  const availabilityByStaffId = eligibleDesignAvailability.reduce<Record<number, DesignEligibleCaretakerAvailability>>((acc, item) => {
    acc[item.staff.id] = item;
    return acc;
  }, {});

  return (
    <>
      <ServiceOrdersHeader
        statusFilter={designStatusFilter}
        statusOptions={designStatusOptions}
        activeFilterLabel={activeDesignFilterLabel}
        pendingCount={designStats.pending}
        awaitingPaymentCount={designStats.awaitingPayment}
        activeCount={designStats.active}
        loading={designLoading}
        onStatusFilterChange={onStatusFilterChange}
        onRefresh={onRefresh}
      />

      {designError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => onCloseReject()}>
          {designError}
        </Alert>
      )}

      <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {designLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <Typography>Loading design service orders...</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Design Template</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Total Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {designOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No design service orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  designOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.customer?.fullName || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer?.email || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.designTemplateTier.designTemplate.name || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.designTemplateTier.tierName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          color={getDesignStatusChipColor(order.status)}
                          label={getDesignRegistrationStatusLabel(order)}
                        />
                      </TableCell>
                      <TableCell align="center">{formatCurrency(order.totalPrice, 'vi-VN')}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="nowrap" maxHeight={40}>
                          <Tooltip title="View details and tasks">
                            <IconButton size="small" onClick={() => onViewDetail(order.id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canApproveDesign(order.status) && (
                            <Button
                              size="small"
                              variant="contained"
                              className="bg-primary! aspect-square! rounded-full!"
                              disabled={submitting}
                              title="Approve"
                              onClick={() => onApprove(order.id)}
                            >
                              <CheckCircleOutlineIcon />
                            </Button>
                          )}
                          {canRejectDesign(order.status) && (
                            <Button
                              size="small"
                              variant="contained"
                              className="bg-error! aspect-square! rounded-full!"
                              disabled={submitting}
                              title="Reject"
                              onClick={() => onOpenRejectDialog(order)}
                            >
                              <CancelOutlinedIcon />
                            </Button>
                          )}
                          {canManagerCancelDesign(order.status) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              className="bg-error! aspect-square! rounded-full!"
                              disabled={submitting}
                              title="Cancel"
                              onClick={() => onOpenCancelDialog(order)}
                            >
                              <CancelOutlinedIcon />
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <DesignOrderDetailDialog
        open={designDetailOpen}
        loading={designDetailLoading}
        submitting={submitting}
        detailItem={designDetailItem}
        onClose={onCloseDetail}
        onApprove={onApprove}
        onReject={(item) => onOpenRejectDialog(item as CustomerDesignRegistrationListItem)}
        onCancel={(item) => onOpenCancelDialog(item as CustomerDesignRegistrationListItem)}
        onAssignTask={onOpenTaskAssignDialog}
        onRescheduleTask={onOpenTaskRescheduleDialog}
        getDesignRegistrationStatusLabel={getDesignRegistrationStatusLabel}
        getDesignTaskStatusLabel={getDesignTaskStatusLabel}
        getDesignTaskTypeLabel={getDesignTaskTypeLabel}
      />

      <DesignOrderCancelDialog
        open={Boolean(designCancelTarget)}
        target={designCancelTarget}
        reason={designCancelReason}
        submitting={submitting}
        onReasonChange={onCancelReasonChange}
        onClose={onCloseCancel}
        onConfirm={onConfirmCancel}
      />

      <DesignOrderRejectDialog
        open={Boolean(designRejectTarget)}
        target={designRejectTarget}
        reason={designRejectReason}
        submitting={submitting}
        onReasonChange={onRejectReasonChange}
        onClose={onCloseReject}
        onConfirm={onConfirmReject}
      />

      <DesignTaskAssignDialog
        open={Boolean(designTaskAssignTarget)}
        target={designTaskAssignTarget}
        registration={designTaskAssignRegistration}
        caretakers={eligibleDesignCaretakers}
        availabilityByStaffId={availabilityByStaffId}
        scheduledDate={designTaskScheduledDate}
        loading={designAssignLoading}
        submitting={submitting}
        selectedCaretakerId={selectedDesignCaretakerId}
        onClose={onCloseTaskAssign}
        onScheduledDateChange={onScheduledDateChange}
        onSelectedCaretakerIdChange={onSelectedCaretakerIdChange}
        onConfirm={onConfirmAssign}
        getDesignTaskTypeLabel={getDesignTaskTypeLabel}
      />
    </>
  );
}

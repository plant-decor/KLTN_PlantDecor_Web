'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, TableContainer, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import {
  approveManagerServiceRegistration,
  assignCaretakerToManagerServiceRegistration,
  getEligibleCaretakersForServiceRegistration,
  getManagerNurseryServiceRegistrationDetail,
  getManagerNurseryServiceRegistrations,
  managerCancelServiceRegistration,
  rejectManagerServiceRegistration,
} from '@/lib/api/careServiceService';
import type { EligibleCaretaker, ManagerServiceRegistration, ServiceRegistrationStatusEnum } from '@/types/care-service.types';
import { ALL_STATUS_FILTER, getErrorMessage } from './managerServiceOrders.constants';
import ServiceOrdersHeader from './ServiceOrdersHeader';
import ServiceOrdersTable from './ServiceOrdersTable';
import ServiceOrderDetailDialog from './ServiceOrderDetailDialog';
import ServiceOrderApproveDialog from './ServiceOrderApproveDialog';
import ServiceOrderRejectDialog from './ServiceOrderRejectDialog';
import ServiceOrderCancelDialog from './ServiceOrderCancelDialog';
import ServiceOrderAssignDialog from './ServiceOrderAssignDialog';
import { SERVICE_STATUS_OPTIONS } from './managerServiceOrders.constants';

export default function ManagerServiceOrdersPageClient() {
  const [items, setItems] = useState<ManagerServiceRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<typeof ALL_STATUS_FILTER | ServiceRegistrationStatusEnum>(ALL_STATUS_FILTER);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ManagerServiceRegistration | null>(null);

  const [approveTarget, setApproveTarget] = useState<ManagerServiceRegistration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ManagerServiceRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelTarget, setCancelTarget] = useState<ManagerServiceRegistration | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [assignTarget, setAssignTarget] = useState<ManagerServiceRegistration | null>(null);
  const [eligibleCaretakers, setEligibleCaretakers] = useState<EligibleCaretaker[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);

  const activeFilterLabel = useMemo(
    () => SERVICE_STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || 'Tất cả trạng thái',
    [statusFilter]
  );

  const stats = useMemo(() => {
    return {
      pending: items.filter((item) => item.status === 1).length,
      awaitingPayment: items.filter((item) => item.status === 2).length,
      active: items.filter((item) => item.status === 3).length,
    };
  }, [items]);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getManagerNurseryServiceRegistrations(
        {
          pageNumber,
          pageSize,
          status: statusFilter === ALL_STATUS_FILTER ? undefined : statusFilter,
        },
        false
      );

      setItems(response.items);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Không thể tải danh sách đơn dịch vụ');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, statusFilter]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const refreshDetailIfNeeded = useCallback(
    async (registrationId: number) => {
      if (!detailOpen || detailItem?.id !== registrationId) {
        return;
      }

      try {
        const refreshed = await getManagerNurseryServiceRegistrationDetail(registrationId, false);
        setDetailItem(refreshed);
      } catch {
        // Keep current detail content if refresh fails.
      }
    },
    [detailItem?.id, detailOpen]
  );

  const handleViewDetail = async (id: number) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const response = await getManagerNurseryServiceRegistrationDetail(id, false);
      setDetailItem(response);
    } catch (viewError) {
      toast.error(getErrorMessage(viewError, 'Không thể tải chi tiết đơn dịch vụ'));
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await approveManagerServiceRegistration(approveTarget.id, false);
      toast.success('Phê duyệt đơn dịch vụ thành công');
      setApproveTarget(null);
      await Promise.all([loadList(), refreshDetailIfNeeded(approveTarget.id)]);
    } catch (approveError) {
      toast.error(getErrorMessage(approveError, 'Không thể phê duyệt đơn dịch vụ'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);
      await rejectManagerServiceRegistration(rejectTarget.id, trimmedReason, false);
      toast.success('Đã từ chối đơn dịch vụ');
      setRejectTarget(null);
      setRejectReason('');
      await Promise.all([loadList(), refreshDetailIfNeeded(rejectTarget.id)]);
    } catch (rejectError) {
      toast.error(getErrorMessage(rejectError, 'Không thể từ chối đơn dịch vụ'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleManagerCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      setSubmitting(true);
      await managerCancelServiceRegistration(cancelTarget.id, trimmedReason, false);
      toast.success('Đã hủy đơn dịch vụ thành công');
      setCancelTarget(null);
      setCancelReason('');
      await Promise.all([loadList(), refreshDetailIfNeeded(cancelTarget.id)]);
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError, 'Không thể hủy đơn dịch vụ'));
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignDialog = async (registration: ManagerServiceRegistration) => {
    try {
      setAssignTarget(registration);
      setAssignLoading(true);
      setSelectedCaretakerId(0);
      const caretakers = await getEligibleCaretakersForServiceRegistration(registration.id, false);
      setEligibleCaretakers(caretakers);
      if (caretakers.length > 0) {
        setSelectedCaretakerId(caretakers[0].id);
      }
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Không thể tải danh sách caretaker phù hợp'));
      setAssignTarget(null);
      setEligibleCaretakers([]);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignCaretaker = async () => {
    if (!assignTarget || !selectedCaretakerId) {
      toast.error('Vui lòng chọn caretaker');
      return;
    }

    try {
      setSubmitting(true);
      await assignCaretakerToManagerServiceRegistration(assignTarget.id, { caretakerId: selectedCaretakerId }, false);
      toast.success('Đã giao caretaker thành công');
      setAssignTarget(null);
      setEligibleCaretakers([]);
      setSelectedCaretakerId(0);
      await Promise.all([loadList(), refreshDetailIfNeeded(assignTarget.id)]);
    } catch (assignError) {
      toast.error(getErrorMessage(assignError, 'Không thể giao caretaker'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Đơn dịch vụ
        </Typography>
        <Typography color="text.secondary">Quản lý đăng ký dịch vụ thuộc vựa của bạn</Typography>
      </Box>

      <ServiceOrdersHeader
        statusFilter={statusFilter}
        activeFilterLabel={activeFilterLabel}
        pendingCount={stats.pending}
        awaitingPaymentCount={stats.awaitingPayment}
        activeCount={stats.active}
        loading={loading}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPageNumber(1);
        }}
        onRefresh={() => void loadList()}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <ServiceOrdersTable
                items={items}
                submitting={submitting}
                onViewDetail={handleViewDetail}
                onApprove={(item) => setApproveTarget(item)}
                onReject={(item) => {
                  setRejectTarget(item);
                  setRejectReason('');
                }}
                onCancel={(item) => {
                  setCancelTarget(item);
                  setCancelReason('');
                }}
                onAssignCaretaker={(item) => void openAssignDialog(item)}
              />
            </TableContainer>
          </>
        )}
      </Paper>

      <ServiceOrderDetailDialog
        open={detailOpen}
        loading={detailLoading}
        submitting={submitting}
        detailItem={detailItem}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        onApprove={(item) => setApproveTarget(item)}
        onReject={(item) => {
          setRejectTarget(item);
          setRejectReason('');
        }}
        onCancel={(item) => {
          setCancelTarget(item);
          setCancelReason('');
        }}
        onAssignCaretaker={(item) => void openAssignDialog(item)}
      />

      <ServiceOrderApproveDialog
        open={Boolean(approveTarget)}
        target={approveTarget}
        submitting={submitting}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => void handleApprove()}
      />

      <ServiceOrderRejectDialog
        open={Boolean(rejectTarget)}
        target={rejectTarget}
        reason={rejectReason}
        submitting={submitting}
        onReasonChange={setRejectReason}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => void handleReject()}
      />

      <ServiceOrderCancelDialog
        open={Boolean(cancelTarget)}
        target={cancelTarget}
        reason={cancelReason}
        submitting={submitting}
        onReasonChange={setCancelReason}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void handleManagerCancel()}
      />

      <ServiceOrderAssignDialog
        open={Boolean(assignTarget)}
        target={assignTarget}
        selectedCaretakerId={selectedCaretakerId}
        eligibleCaretakers={eligibleCaretakers}
        loading={assignLoading}
        submitting={submitting}
        onSelectedCaretakerIdChange={setSelectedCaretakerId}
        onClose={() => {
          setAssignTarget(null);
          setEligibleCaretakers([]);
        }}
        onConfirm={() => void handleAssignCaretaker()}
      />
    </Box>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import {
  approveManagerReturnTicketItem,
  getManagerReturnTicketAssignmentDetail,
  getManagerReturnTicketAssignments,
  rejectManagerReturnTicketItem,
  refundManagerReturnTicketItem,
  startManagerReturnTicketAssignmentReview,
} from '@/lib/api/managerReturnTicketAssignmentsService';
import type {
  ManagerReturnTicketAssignmentDetail,
  ManagerReturnTicketAssignmentListItem,
  ManagerReturnTicketAssignmentListPayload,
  ReturnTicketAssignmentStatus,
} from '@/types/return-ticket.types';
import ManagerReturnTicketAssignmentDetailDialog from './ManagerReturnTicketAssignmentDetailDialog';
import ManagerReturnTicketAssignmentsTable from './ManagerReturnTicketAssignmentsTable';
import ManagerReturnTicketHeader from './ManagerReturnTicketHeader';
import {
  ALL_ASSIGNMENT_STATUS_FILTER,
  getErrorMessage,
} from './managerReturnTicket.constants';
import { CustomLoading } from '@/components/CustomLoading';

const DEFAULT_PAGE_SIZE = 10;

interface ManagerReturnTicketManagementPageClientProps {
  onPendingBadgeLoaded?: (pendingCount: number) => void;
  onRefundCompleted?: (pendingCount: number) => void;
}

const extractListItems = (payload: ManagerReturnTicketAssignmentListPayload) => {
  return Array.isArray(payload) ? payload : payload.items || [];
};

const extractTotalCount = (payload: ManagerReturnTicketAssignmentListPayload) => {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  return payload.totalCount ?? payload.items.length;
};

export default function ManagerReturnTicketManagementPageClient({
  onPendingBadgeLoaded,
  onRefundCompleted,
}: ManagerReturnTicketManagementPageClientProps) {
  const [items, setItems] = useState<ManagerReturnTicketAssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<number>(ALL_ASSIGNMENT_STATUS_FILTER);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ManagerReturnTicketAssignmentDetail | null>(null);
  const [approveQuantityByItemId, setApproveQuantityByItemId] = useState<Record<number, number>>({});
  const [noteByItemId, setNoteByItemId] = useState<Record<number, string>>({});

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = await getManagerReturnTicketAssignments(
        {
          status:
            statusFilter === ALL_ASSIGNMENT_STATUS_FILTER
              ? undefined
              : (statusFilter as ReturnTicketAssignmentStatus),
        },
        false
      );

      const normalizedItems = extractListItems(payload);

      setItems(normalizedItems);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Failed to load return ticket assignments.');
      setError(message);
      toast.error(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadPendingBadgeCount = useCallback(async (): Promise<number> => {
    const pendingPayload = await getManagerReturnTicketAssignments(
      {
        status: 0,
      },
      false
    );

    return extractTotalCount(pendingPayload);
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!onPendingBadgeLoaded) {
      return;
    }

    let mounted = true;
    const loadBadge = async () => {
      try {
        const pendingCount = await loadPendingBadgeCount();
        if (mounted) {
          onPendingBadgeLoaded(pendingCount);
        }
      } catch {
        if (mounted) {
          onPendingBadgeLoaded(0);
        }
      }
    };

    void loadBadge();

    return () => {
      mounted = false;
    };
  }, [loadPendingBadgeCount, onPendingBadgeLoaded]);

  const pagedItems = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageNumber, pageSize]);

  const openDetailDialog = async (item: ManagerReturnTicketAssignmentListItem) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetail(null);
      setSelectedAssignmentId(item.assignmentId);

      const payload = await getManagerReturnTicketAssignmentDetail(item.assignmentId, false);
      setDetail(payload);

      const initialQuantities: Record<number, number> = {};
      const initialNotes: Record<number, string> = {};
      payload.items.forEach((ticketItem) => {
        initialQuantities[ticketItem.id] = ticketItem.requestedQuantity;
        initialNotes[ticketItem.id] = ticketItem.managerDecisionNote || '';
      });

      setApproveQuantityByItemId(initialQuantities);
      setNoteByItemId(initialNotes);
    } catch (detailError) {
      const message = getErrorMessage(detailError, 'Failed to load assignment detail.');
      toast.error(message);
      setDetailOpen(false);
      setSelectedAssignmentId(null);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadDetail = useCallback(async () => {
    if (!selectedAssignmentId) {
      return;
    }

    const payload = await getManagerReturnTicketAssignmentDetail(selectedAssignmentId, false);
    setDetail(payload);
  }, [selectedAssignmentId]);

  const handleStartReview = async (assignmentId: number) => {
    try {
      setSubmitting(true);
      await startManagerReturnTicketAssignmentReview(assignmentId, true);
      toast.success('Assignment moved to In Review.');
      await Promise.all([loadList(), reloadDetail()]);
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to start review.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveItem = async (
    assignmentId: number,
    item: ManagerReturnTicketAssignmentDetail['items'][number]
  ) => {
    try {
      const approvedQuantity = approveQuantityByItemId[item.id] ?? item.requestedQuantity;
      if (approvedQuantity < 0 || approvedQuantity > item.requestedQuantity) {
        toast.error(`Approved quantity must be between 0 and ${item.requestedQuantity}.`);
        return;
      }

      setSubmitting(true);
      await approveManagerReturnTicketItem(
        assignmentId,
        item.id,
        {
          approvedQuantity,
          note: (noteByItemId[item.id] || '').trim(),
        },
        true
      );

      toast.success('Item approved successfully.');
      await Promise.all([loadList(), reloadDetail()]);
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to approve item.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectItem = async (
    assignmentId: number,
    item: ManagerReturnTicketAssignmentDetail['items'][number]
  ) => {
    try {
      setSubmitting(true);
      await rejectManagerReturnTicketItem(
        assignmentId,
        item.id,
        {
          note: (noteByItemId[item.id] || '').trim(),
        },
        true
      );

      toast.success('Item rejected successfully.');
      await Promise.all([loadList(), reloadDetail()]);
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to reject item.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefundItem = async (
    assignmentId: number,
    item: ManagerReturnTicketAssignmentDetail['items'][number]
  ) => {
    try {
      setSubmitting(true);
      await refundManagerReturnTicketItem(
        assignmentId,
        item.id,
        {},
        true
      );

      toast.success('Item refunded successfully.');
      await Promise.all([loadList(), reloadDetail()]);

      if (onRefundCompleted) {
        const pendingCount = await loadPendingBadgeCount();
        onRefundCompleted(pendingCount);
      }
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to refund item.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, mx: 'auto' }}>
      <ManagerReturnTicketHeader
        statusFilter={statusFilter}
        totalCount={items.length}
        loading={loading}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPageNumber(1);
        }}
        onRefresh={() => void loadList()}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CustomLoading size={18} />
          </Box>
        ) : (
          <ManagerReturnTicketAssignmentsTable
            items={pagedItems}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={items.length}
            onPageChange={setPageNumber}
            onRowsPerPageChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
            onViewDetail={(item) => void openDetailDialog(item)}
          />
        )}
      </Paper>

      <ManagerReturnTicketAssignmentDetailDialog
        open={detailOpen}
        loading={detailLoading}
        submitting={submitting}
        detail={detail}
        approveQuantityByItemId={approveQuantityByItemId}
        noteByItemId={noteByItemId}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
          setSelectedAssignmentId(null);
        }}
        onStartReview={handleStartReview}
        onApproveItem={handleApproveItem}
        onRejectItem={handleRejectItem}
        onRefundItem={handleRefundItem}
        onChangeApproveQuantity={(itemId, quantity) => {
          setApproveQuantityByItemId((prev) => ({ ...prev, [itemId]: quantity }));
        }}
        onChangeItemNote={(itemId, note) => {
          setNoteByItemId((prev) => ({ ...prev, [itemId]: note }));
        }}
      />
    </Box>
  );
}

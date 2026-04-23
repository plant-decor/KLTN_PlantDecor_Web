'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import {
  getManagerNurseryOrderDetail,
  getManagerNurseryOrders,
} from '@/lib/api/managerSalesOrdersService';
import type {
  ManagerNurseryOrder,
  ManagerNurseryOrderDetail,
  ManagerNurseryOrderListPayload,
  ManagerNurseryOrderStatus,
} from '@/types/manager-sales-orders.types';
import ManagerSalesOrderDetailDialog from './ManagerSalesOrderDetailDialog';
import ManagerSalesOrdersHeader from './ManagerSalesOrdersHeader';
import ManagerSalesOrdersTable from './ManagerSalesOrdersTable';
import { ALL_STATUS_FILTER, getErrorMessage } from './managerSalesOrders.constants';
import { CustomLoading } from '@/components/CustomLoading';

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_LIST_PAYLOAD: ManagerNurseryOrderListPayload = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false,
};

export default function ManagerSalesOrdersTabContent() {
  const [listData, setListData] = useState<ManagerNurseryOrderListPayload>(EMPTY_LIST_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus>(
    ALL_STATUS_FILTER
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ManagerNurseryOrderDetail | null>(null);
  const [focusShipperSelector, setFocusShipperSelector] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = await getManagerNurseryOrders(
        {
          status: statusFilter === ALL_STATUS_FILTER ? undefined : statusFilter,
          pageNumber,
          pageSize,
        },
        false
      );

      setListData(payload);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Failed to load sales orders');
      setError(message);
      toast.error(message);
      setListData((previous) => ({ ...previous, items: [] }));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, statusFilter]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const handleViewDetail = async (item: ManagerNurseryOrder) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailItem(null);
      setFocusShipperSelector(false);

      const payload = await getManagerNurseryOrderDetail(item.id, false);
      setDetailItem(payload);
    } catch (detailError) {
      toast.error(getErrorMessage(detailError, 'Failed to load order details'));
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignShipper = async (item: ManagerNurseryOrder) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailItem(null);
      setFocusShipperSelector(true);

      const payload = await getManagerNurseryOrderDetail(item.id, false);
      setDetailItem(payload);
    } catch (detailError) {
      toast.error(getErrorMessage(detailError, 'Failed to load order details'));
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <ManagerSalesOrdersHeader
        statusFilter={statusFilter}
        totalCount={listData.totalCount}
        loading={loading}
        onStatusFilterChange={(value) => {
          setStatusFilter(value as typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus);
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
            <CustomLoading size={18} />
          </Box>
        ) : (
          <ManagerSalesOrdersTable
            items={listData.items}
            pageNumber={listData.pageNumber || pageNumber}
            pageSize={listData.pageSize || pageSize}
            totalCount={listData.totalCount}
            onPageChange={(nextPage) => setPageNumber(nextPage)}
            onRowsPerPageChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
            onViewDetail={(item) => void handleViewDetail(item)}
            onAssignShipper={(item) => void handleAssignShipper(item)}
          />
        )}
      </Paper>

      <ManagerSalesOrderDetailDialog
        open={detailOpen}
        loading={detailLoading}
        detailItem={detailItem}
        focusShipperSelector={focusShipperSelector}
        onShipperUpdated={(updated) => {
          setDetailItem(updated);
          void loadList();
        }}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
          setFocusShipperSelector(false);
        }}
      />
    </>
  );
}

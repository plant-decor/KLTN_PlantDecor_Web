'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import OrderDetailModal from '@/components/order-history/OrderDetailModal';
import OrderHistoryList from '@/components/order-history/OrderHistoryList';
import { STATUS_TABS } from '@/components/order-history/orderHistoryUtils';
import {
  cancelOrder,
  continuePaymentByInvoice,
  getInvoicesByOrderId,
  getMyOrderById,
  getMyOrders,
} from '@/lib/api/orderService';
import type { Order } from '@/types/order.types';

export default function OrdersPage() {
  const tOrderHistory = useTranslations('orderHistory');
  const [currentTab, setCurrentTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const requestSequenceRef = useRef(0);

  const [retryLoadingOrderId, setRetryLoadingOrderId] = useState<number | null>(null);
  const [retryError, setRetryError] = useState('');
  const [cancelLoadingOrderId, setCancelLoadingOrderId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<number | null>(null);

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedStatus = STATUS_TABS[currentTab]?.value ?? 'All';

  useEffect(() => {
    let isMounted = true;
    const requestId = ++requestSequenceRef.current;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orderStatus = selectedStatus === 'All' ? undefined : selectedStatus;
        const list = await getMyOrders(orderStatus);

        if (!isMounted || requestId !== requestSequenceRef.current) {
          return;
        }

        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!isMounted || requestId !== requestSequenceRef.current) {
          return;
        }

        console.error(err instanceof Error ? err.message : 'Cannot load order list');
      } finally {
        if (isMounted && requestId === requestSequenceRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [selectedStatus]);

  const handleViewDetail = useCallback(async (orderId: number) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError('');
      setDetailOrder(null);

      const order = await getMyOrderById(orderId);
      if (!order) {
        setDetailError('Cannot load order detail.');
        return;
      }

      setDetailOrder(order);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Cannot load order detail.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleRetryPayment = useCallback(async (orderId: number) => {
    try {
      setRetryLoadingOrderId(orderId);
      setRetryError('');

      const invoices = await getInvoicesByOrderId(orderId);
      const pendingInvoices = invoices.filter((invoice) => invoice.statusName === 'Pending');

      if (pendingInvoices.length === 0) {
        throw new Error(tOrderHistory('retryPaymentFailed'));
      }

      const latestPendingInvoice = pendingInvoices
        .slice()
        .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())[0];

      if (!latestPendingInvoice) {
        throw new Error(tOrderHistory('retryPaymentFailed'));
      }

      const paymentUrl = await continuePaymentByInvoice(latestPendingInvoice.id);
      window.location.assign(paymentUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : tOrderHistory('retryPaymentFailed');
      setRetryError(message);
    } finally {
      setRetryLoadingOrderId(null);
    }
  }, [tOrderHistory]);

  const confirmCancelOrder = useCallback(async () => {
    if (cancelConfirmOrderId === null) {
      return;
    }

    try {
      setCancelLoadingOrderId(cancelConfirmOrderId);
      setCancelError('');

      const cancelledOrder = await cancelOrder(cancelConfirmOrderId);

      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order.id === cancelledOrder.id ? cancelledOrder : order
        );

        if (selectedStatus === 'All') {
          return updatedOrders;
        }

        return updatedOrders.filter((order) => order.statusName === selectedStatus);
      });

      setDetailOrder((prevDetail) =>
        prevDetail && prevDetail.id === cancelledOrder.id ? cancelledOrder : prevDetail
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : tOrderHistory('cancelOrderFailed');
      setCancelError(message);
    } finally {
      setCancelLoadingOrderId(null);
      setCancelConfirmOrderId(null);
    }
  }, [cancelConfirmOrderId, selectedStatus, tOrderHistory]);

  const handleCancelOrder = useCallback((orderId: number) => {
    if (cancelLoadingOrderId !== null) {
      return Promise.resolve();
    }

    setCancelConfirmOrderId(orderId);
    return Promise.resolve();
  }, [cancelLoadingOrderId]);

  const closeDetailModal = useCallback(() => {
    setDetailOpen(false);
    setRetryError('');
    setCancelError('');
  }, []);

  const closeCancelConfirmModal = useCallback(() => {
    if (cancelLoadingOrderId !== null) {
      return;
    }

    setCancelConfirmOrderId(null);
  }, [cancelLoadingOrderId]);

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        {tOrderHistory('title')}
      </Typography>

      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {retryError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setRetryError('')}>
          {retryError}
        </Alert>
      ) : null}
      {cancelError ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCancelError('')}>
          {cancelError}
        </Alert>
      ) : null}

      <OrderHistoryList
        orders={orders}
        loading={loading}
        retryLoadingOrderId={retryLoadingOrderId}
        cancelLoadingOrderId={cancelLoadingOrderId}
        onViewDetail={handleViewDetail}
        onRetryPayment={handleRetryPayment}
        onCancelOrder={handleCancelOrder}
      />

      <OrderDetailModal
        open={detailOpen}
        order={detailOrder}
        loading={detailLoading}
        error={detailError}
        retryLoadingOrderId={retryLoadingOrderId}
        cancelLoadingOrderId={cancelLoadingOrderId}
        onRetryPayment={handleRetryPayment}
        onCancelOrder={handleCancelOrder}
        onClose={closeDetailModal}
      />

      <Dialog open={cancelConfirmOrderId !== null} onClose={closeCancelConfirmModal} maxWidth="xs" fullWidth>
        <DialogTitle>{tOrderHistory('cancelConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {tOrderHistory('cancelConfirmMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelConfirmModal} disabled={cancelLoadingOrderId !== null}>
            {tOrderHistory('keepOrder')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void confirmCancelOrder()}
            disabled={cancelLoadingOrderId !== null}
          >
            {cancelLoadingOrderId !== null
              ? tOrderHistory('cancelling')
              : tOrderHistory('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

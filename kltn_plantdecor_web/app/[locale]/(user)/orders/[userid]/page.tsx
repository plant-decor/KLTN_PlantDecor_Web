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
import {
  cancelOrder,
  continuePaymentByInvoice,
  getPendingInvoicesForCurrentUser,
  getInvoicesByOrderId,
  getMyOrderById,
  getMyOrders,
} from '@/lib/api/orderService';
import type { Order } from '@/types/order.types';

type OrdersTab = 0 | 1;

function hasPendingInvoice(order: Order): boolean {
  return order.invoices.some((invoice) => invoice.statusName === 'Pending');
}

export default function OrdersPage() {
  const tOrderHistory = useTranslations('orderHistory');
  const [currentTab, setCurrentTab] = useState<OrdersTab>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loadingAllOrders, setLoadingAllOrders] = useState(true);
  const [loadingPendingOrders, setLoadingPendingOrders] = useState(false);
  const allOrdersRequestSequenceRef = useRef(0);
  const pendingOrdersRequestSequenceRef = useRef(0);

  const [retryLoadingOrderId, setRetryLoadingOrderId] = useState<number | null>(null);
  const [paymentLoadingInvoiceId, setPaymentLoadingInvoiceId] = useState<number | null>(null);
  const [retryError, setRetryError] = useState('');
  const [cancelLoadingOrderId, setCancelLoadingOrderId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState('');
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<number | null>(null);

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchAllOrders = useCallback(async () => {
    const requestId = ++allOrdersRequestSequenceRef.current;

    try {
      setLoadingAllOrders(true);
      const list = await getMyOrders();
      if (requestId !== allOrdersRequestSequenceRef.current) {
        return;
      }
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      if (requestId !== allOrdersRequestSequenceRef.current) {
        return;
      }
      console.error(err instanceof Error ? err.message : 'Cannot load order list');
    } finally {
      if (requestId === allOrdersRequestSequenceRef.current) {
        setLoadingAllOrders(false);
      }
    }
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    const requestId = ++pendingOrdersRequestSequenceRef.current;

    try {
      setLoadingPendingOrders(true);
      const pendingInvoices = await getPendingInvoicesForCurrentUser();

      if (requestId !== pendingOrdersRequestSequenceRef.current) {
        return;
      }

      if (pendingInvoices.length === 0) {
        setPendingOrders([]);
        return;
      }

      const latestInvoiceByOrder = new Map<number, string>();
      pendingInvoices.forEach((invoice) => {
        const currentIssuedDate = latestInvoiceByOrder.get(invoice.orderId);
        if (!currentIssuedDate || new Date(invoice.issuedDate).getTime() > new Date(currentIssuedDate).getTime()) {
          latestInvoiceByOrder.set(invoice.orderId, invoice.issuedDate);
        }
      });

      const sortedOrderIds = [...latestInvoiceByOrder.entries()]
        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
        .map(([orderId]) => orderId);

      const orderDetails = await Promise.all(sortedOrderIds.map((orderId) => getMyOrderById(orderId)));

      if (requestId !== pendingOrdersRequestSequenceRef.current) {
        return;
      }

      const mappedOrders = orderDetails.filter((order): order is Order => !!order && hasPendingInvoice(order));
      setPendingOrders(mappedOrders);
    } catch (err) {
      if (requestId !== pendingOrdersRequestSequenceRef.current) {
        return;
      }
      console.error(err instanceof Error ? err.message : 'Cannot load pending orders');
      setPendingOrders([]);
    } finally {
      if (requestId === pendingOrdersRequestSequenceRef.current) {
        setLoadingPendingOrders(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  useEffect(() => {
    if (currentTab !== 1) {
      return;
    }

    void fetchPendingOrders();
  }, [currentTab, fetchPendingOrders]);

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

  const handlePayInvoice = useCallback(async (invoiceId: number) => {
    try {
      setPaymentLoadingInvoiceId(invoiceId);
      setRetryError('');

      const paymentUrl = await continuePaymentByInvoice(invoiceId);
      window.location.assign(paymentUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : tOrderHistory('retryPaymentFailed');
      setRetryError(message);
    } finally {
      setPaymentLoadingInvoiceId(null);
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

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === cancelledOrder.id ? cancelledOrder : order))
      );

      setPendingOrders((prevOrders) =>
        prevOrders
          .map((order) => (order.id === cancelledOrder.id ? cancelledOrder : order))
          .filter((order) => hasPendingInvoice(order))
      );

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
  }, [cancelConfirmOrderId, tOrderHistory]);

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
          onChange={(_, value) => setCurrentTab(value as OrdersTab)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          }}
        >
          <Tab label={tOrderHistory('allOrdersTab')} />
          <Tab label={tOrderHistory('pendingPaymentTab')} />
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
        orders={currentTab === 0 ? orders : pendingOrders}
        loading={currentTab === 0 ? loadingAllOrders : loadingPendingOrders}
        retryLoadingOrderId={retryLoadingOrderId}
        cancelLoadingOrderId={cancelLoadingOrderId}
        onViewDetail={handleViewDetail}
        onRetryPayment={handleRetryPayment}
        onCancelOrder={handleCancelOrder}
        emptyMessage={
          currentTab === 0 ? tOrderHistory('noOrdersFound') : tOrderHistory('noPendingOrdersFound')
        }
      />

      <OrderDetailModal
        open={detailOpen}
        order={detailOrder}
        loading={detailLoading}
        error={detailError}
        retryLoadingOrderId={retryLoadingOrderId}
        paymentLoadingInvoiceId={paymentLoadingInvoiceId}
        cancelLoadingOrderId={cancelLoadingOrderId}
        onPayInvoice={handlePayInvoice}
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

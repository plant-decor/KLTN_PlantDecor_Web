'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Card, Tab, Tabs, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import OrderDetailModal from '@/components/order-history/OrderDetailModal';
import OrderHistoryList from '@/components/order-history/OrderHistoryList';
import { STATUS_TABS } from '@/components/order-history/orderHistoryUtils';
import { getMyOrderById, getMyOrders, retryPayment } from '@/lib/api/orderService';
import type { Order } from '@/types/order.types';

export default function OrdersPage() {
  const tOrderHistory = useTranslations('orderHistory');
  const [currentTab, setCurrentTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestSequenceRef = useRef(0);

  const [retryLoadingPaymentId, setRetryLoadingPaymentId] = useState<number | null>(null);
  const [retryError, setRetryError] = useState('');

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
        setError('');
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

        setError(err instanceof Error ? err.message : 'Cannot load order list');
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

  const handleRetryPayment = useCallback(async (paymentId: number) => {
    try {
      setRetryLoadingPaymentId(paymentId);
      setRetryError('');
      const paymentUrl = await retryPayment(paymentId);
      window.location.assign(paymentUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : tOrderHistory('retryPaymentFailed');
      setRetryError(message);
    } finally {
      setRetryLoadingPaymentId(null);
    }
  }, [tOrderHistory]);

  const closeDetailModal = useCallback(() => {
    setDetailOpen(false);
    setRetryError('');
  }, []);

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        {tOrderHistory('title')}
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      ) : null}

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

      <OrderHistoryList
        orders={orders}
        loading={loading}
        retryLoadingPaymentId={retryLoadingPaymentId}
        onViewDetail={handleViewDetail}
        onRetryPayment={handleRetryPayment}
      />

      <OrderDetailModal
        open={detailOpen}
        order={detailOrder}
        loading={detailLoading}
        error={detailError}
        retryLoadingPaymentId={retryLoadingPaymentId}
        onRetryPayment={handleRetryPayment}
        onClose={closeDetailModal}
      />
    </Box>
  );
}

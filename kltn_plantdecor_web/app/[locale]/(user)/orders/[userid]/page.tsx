'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, Tab, Tabs, Typography } from '@mui/material';
import OrderDetailModal from '@/components/order-history/OrderDetailModal';
import OrderHistoryList from '@/components/order-history/OrderHistoryList';
import { STATUS_TABS } from '@/components/order-history/orderHistoryUtils';
import { getMyOrderById, getMyOrders } from '@/lib/api/orderService';
import type { Order } from '@/types/order.types';

export default function OrdersPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const list = await getMyOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Cannot load order list');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const selectedStatus = STATUS_TABS[currentTab]?.value ?? 'All';

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'All') {
      return orders;
    }
    return orders.filter((order) => order.statusName === selectedStatus);
  }, [orders, selectedStatus]);

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Order history
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

      <OrderHistoryList orders={filteredOrders} loading={loading} onViewDetail={handleViewDetail} />

      <OrderDetailModal
        open={detailOpen}
        order={detailOrder}
        loading={detailLoading}
        error={detailError}
        onClose={() => setDetailOpen(false)}
      />
    </Box>
  );
}

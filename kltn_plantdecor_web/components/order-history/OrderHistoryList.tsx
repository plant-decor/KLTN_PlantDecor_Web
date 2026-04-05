'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslations } from 'next-intl';
import type { Order } from '@/types/order.types';
import { formatCurrency, formatDate, getStatusInfo } from './orderHistoryUtils';

interface OrderHistoryListProps {
  orders: Order[];
  loading: boolean;
  retryLoadingPaymentId: number | null;
  onViewDetail: (orderId: number) => void;
  onRetryPayment: (paymentId: number) => Promise<void>;
}

export default function OrderHistoryList({
  orders,
  loading,
  retryLoadingPaymentId,
  onViewDetail,
  onRetryPayment,
}: OrderHistoryListProps) {
  const tOrderHistory = useTranslations('orderHistory');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {tOrderHistory('noOrdersFound')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.statusName);
        const displayItems = order.items.slice(0, 2);
        const remainingItems = order.items.length - displayItems.length;
        const retryPaymentId = order.statusName === 'Pending' ? order.id : null;
        const isRetrying = retryPaymentId !== null && retryLoadingPaymentId === retryPaymentId;

        return (
          <Card key={order.id} sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    #{order.id}
                  </Typography>
                  <Chip
                    label={order.orderType === 2 ? tOrderHistory('orderType.uniquePlant') : tOrderHistory('orderType.product')}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Chip
                  icon={statusInfo.icon}
                  label={order.statusName}
                  color={statusInfo.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {tOrderHistory('orderedAt')}: {formatDate(order.createdAt)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                {displayItems.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: index < displayItems.length - 1 ? 1.5 : 0,
                    }}
                  >
                    <Avatar variant="rounded" sx={{ width: 60, height: 60, bgcolor: 'grey.200' }}>
                      <ShoppingCartIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.itemName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        x{item.quantity} - {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {remainingItems > 0 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    + {remainingItems} {tOrderHistory('moreItems')}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {tOrderHistory('total')}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onViewDetail(order.id)}
                >
                  {tOrderHistory('viewDetail')}
                </Button>
                {retryPaymentId !== null ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => void onRetryPayment(retryPaymentId)}
                    disabled={isRetrying}
                  >
                    {isRetrying ? tOrderHistory('retryingPayment') : tOrderHistory('retryPayment')}
                  </Button>
                ) : null}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

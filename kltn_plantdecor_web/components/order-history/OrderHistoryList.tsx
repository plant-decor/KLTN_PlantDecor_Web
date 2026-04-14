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
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslations } from 'next-intl';
import type { Order } from '@/types/order.types';
import { formatCurrency, formatDate, getStatusInfo } from './orderHistoryUtils';

interface OrderHistoryListProps {
  orders: Order[];
  loading: boolean;
  retryLoadingOrderId: number | null;
  cancelLoadingOrderId: number | null;
  onViewDetail: (orderId: number) => void;
  onRetryPayment: (orderId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}

export default function OrderHistoryList({
  orders,
  loading,
  retryLoadingOrderId,
  cancelLoadingOrderId,
  onViewDetail,
  onRetryPayment,
  onCancelOrder,
}: OrderHistoryListProps) {
  const tOrderHistory = useTranslations('orderHistory');

  const getOrderTypeLabel = (orderType: number) => {
    switch (orderType) {
      case 2:
        return tOrderHistory('orderType.uniquePlant');
      case 3:
        return tOrderHistory('orderType.buyNow');
      case 4:
        return tOrderHistory('orderType.service');
      default:
        return tOrderHistory('orderType.product');
    }
  };

  const getOrderItemIcon = (orderType: number) => {
    if (orderType === 4) {
      return <MiscellaneousServicesIcon />;
    }

    return <ShoppingCartIcon />;
  };

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
        const retryOrderId = order.statusName === 'Pending' ? order.id : null;
        const isRetrying = retryOrderId !== null && retryLoadingOrderId === retryOrderId;
        const canCancelOrder = order.statusName === 'Pending' || order.statusName === 'DepositPaid';
        const isCancelling = canCancelOrder && cancelLoadingOrderId === order.id;

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
                    label={getOrderTypeLabel(order.orderType)}
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
                      {getOrderItemIcon(order.orderType)}
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
                  alignItems: 'end',
                  justifyContent:'space-between',
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
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onViewDetail(order.id)}
                >
                  {tOrderHistory('viewDetail')}
                </Button>
                {retryOrderId !== null ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => void onRetryPayment(retryOrderId)}
                    disabled={isRetrying || isCancelling}
                  >
                    {isRetrying ? tOrderHistory('retryingPayment') : tOrderHistory('retryPayment')}
                  </Button>
                ) : null}
                {canCancelOrder ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => void onCancelOrder(order.id)}
                    disabled={isCancelling || isRetrying}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel order'}
                  </Button>
                ) : null}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}


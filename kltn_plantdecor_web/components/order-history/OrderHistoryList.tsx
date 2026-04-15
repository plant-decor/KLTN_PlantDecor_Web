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
import type { Order, OrderInvoiceDetail } from '@/types/order.types';
import { formatCurrency, formatDate, getStatusInfo } from './orderHistoryUtils';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

const SERVICE_ORDER_TYPE = 4;
const ORDER_ITEM_FALLBACK_IMAGE = '/img/fallbackplant.avif';

type OrderDisplayItem = {
  id: number;
  itemName: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
};

function mapInvoiceDetailToDisplayItem(detail: OrderInvoiceDetail): OrderDisplayItem {
  return {
    id: detail.id,
    itemName: detail.itemName,
    quantity: detail.quantity,
    price: detail.unitPrice,
  };
}

function getDisplayItems(order: Order): OrderDisplayItem[] {
  if (order.orderType !== SERVICE_ORDER_TYPE) {
    return order.items;
  }

  const invoiceWithDetails = order.invoices.find((invoice) => invoice.details.length > 0);
  return invoiceWithDetails ? invoiceWithDetails.details.map(mapInvoiceDetailToDisplayItem) : [];
}

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
      case SERVICE_ORDER_TYPE:
        return tOrderHistory('orderType.service');
      default:
        return tOrderHistory('orderType.product');
    }
  };

  const getOrderItemIcon = (orderType: number) => {
    if (orderType === SERVICE_ORDER_TYPE) {
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
        const displayItems = getDisplayItems(order).slice(0, 2);
        const totalDisplayItems = getDisplayItems(order).length;
        const remainingItems = totalDisplayItems - displayItems.length;
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
                    {order.orderType === SERVICE_ORDER_TYPE ? (
                      <Avatar variant="rounded" sx={{ width: 60, height: 60, bgcolor: 'grey.200' }}>
                        {getOrderItemIcon(order.orderType)}
                      </Avatar>
                    ) : (
                      <Avatar
                        variant="rounded"
                        src={item.imageUrl || ORDER_ITEM_FALLBACK_IMAGE}
                        alt={item.itemName}
                        imgProps={{ loading: 'lazy' }}
                        sx={{ width: 60, height: 60, bgcolor: 'grey.200' }}
                      />
                    )}
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
                  sx={{...hoverLiftStyle}}
                >
                  {tOrderHistory('viewDetail')}
                </Button>
                {retryOrderId !== null ? (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
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
                    sx={{...hoverLiftStyle}}
                    onClick={() => void onCancelOrder(order.id)}
                    disabled={isCancelling || isRetrying}
                  >
                    {isCancelling ? tOrderHistory('cancelling') : tOrderHistory('cancelOrder')}
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

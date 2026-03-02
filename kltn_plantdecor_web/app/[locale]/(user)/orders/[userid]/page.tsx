'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Avatar,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestoreIcon from '@mui/icons-material/Restore';
import { orderHistoryData } from '@/data/dashboardMockData';

interface PageProps {
  params: Promise<{ userid: string }>;
}

type OrderStatus = 'All' | 'Pending' | 'Shipping' | 'Completed' | 'Cancelled';

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge color and label
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: 'warning' as const, label: 'Chờ xử lý', icon: <ShoppingCartIcon /> };
    case 'Confirmed':
      return { color: 'info' as const, label: 'Đã xác nhận', icon: <CheckCircleIcon /> };
    case 'Shipping':
      return { color: 'primary' as const, label: 'Đang giao', icon: <LocalShippingIcon /> };
    case 'Delivered':
      return { color: 'success' as const, label: 'Đã giao', icon: <CheckCircleIcon /> };
    case 'Completed':
      return { color: 'success' as const, label: 'Hoàn thành', icon: <CheckCircleIcon /> };
    case 'Cancelled':
      return { color: 'error' as const, label: 'Đã hủy', icon: <CancelIcon /> };
    default:
      return { color: 'default' as const, label: status, icon: <ShoppingCartIcon /> };
  }
};

// Get order progress steps
const getOrderSteps = (order: any) => {
  const steps = ['Đặt hàng', 'Xác nhận', 'Đang giao', 'Hoàn thành'];
  let activeStep = 0;

  if (order.status === 'Cancelled') {
    return { steps: ['Đặt hàng', 'Đã hủy'], activeStep: 1 };
  }

  if (order.status === 'Pending') activeStep = 0;
  else if (order.status === 'Confirmed') activeStep = 1;
  else if (order.status === 'Shipping') activeStep = 2;
  else if (order.status === 'Delivered' || order.status === 'Completed') activeStep = 3;

  return { steps, activeStep };
};

export default function OrdersPage({ params }: PageProps) {
  const [currentTab, setCurrentTab] = useState<OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filter orders by status
  const filteredOrders =
    currentTab === 'All'
      ? orderHistoryData
      : orderHistoryData.filter((order) => order.status === currentTab);

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleReorder = (order: any) => {
    console.log('Reorder:', order);
    // TODO: Add items to cart and redirect to cart page
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Lịch sử đơn hàng
      </Typography>

      {/* Status Filter Tabs */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          <Tab label="Tất cả" value="All" />
          <Tab label="Chờ xác nhận" value="Pending" />
          <Tab label="Đang giao" value="Shipping" />
          <Tab label="Hoàn thành" value="Completed" />
          <Tab label="Đã hủy" value="Cancelled" />
        </Tabs>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có đơn hàng nào
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const displayItems = order.items.slice(0, 2);
            const remainingCount = order.items.length - 2;

            return (
              <Card key={order.id} sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  {/* Card Header */}
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
                        {order.id}
                      </Typography>
                      <Chip
                        label={order.orderType === 'Product' ? 'Sản phẩm' : 'Dịch vụ'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Chip
                      icon={statusInfo.icon}
                      label={statusInfo.label}
                      color={statusInfo.color}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ngày đặt: {formatDate(order.createdAt)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Card Body - Items */}
                  <Box sx={{ mb: 2 }}>
                    {displayItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: index < displayItems.length - 1 ? 1.5 : 0,
                        }}
                      >
                        <Avatar
                          src={item.imageUrl}
                          alt={item.itemName}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
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

                    {remainingCount > 0 && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        + {remainingCount} sản phẩm khác
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Card Footer */}
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
                        Tổng tiền
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetail(order)}
                        size="small"
                      >
                        Xem chi tiết
                      </Button>
                      {order.status === 'Completed' && (
                        <Button
                          variant="contained"
                          startIcon={<RestoreIcon />}
                          onClick={() => handleReorder(order)}
                          size="small"
                        >
                          Mua lại
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  Chi tiết đơn hàng
                </Typography>
                <Chip
                  label={getStatusInfo(selectedOrder.status).label}
                  color={getStatusInfo(selectedOrder.status).color}
                  icon={getStatusInfo(selectedOrder.status).icon}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Order Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Mã đơn hàng
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedOrder.id}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ngày đặt hàng
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedOrder.createdAt)}</Typography>
                </Box>
                {selectedOrder.completedAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ngày hoàn thành
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedOrder.completedAt)}</Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Delivery Progress */}
              {selectedOrder.status !== 'Cancelled' && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Tiến độ giao hàng
                  </Typography>
                  <Stepper
                    activeStep={getOrderSteps(selectedOrder).activeStep}
                    alternativeLabel
                    sx={{ mb: 3 }}
                  >
                    {getOrderSteps(selectedOrder).steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {/* Shipping Information */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin giao hàng
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Người nhận
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.customerName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.phoneNumber}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Địa chỉ
                </Typography>
                <Typography variant="body1">{selectedOrder.address}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Order Items Table */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Chi tiết sản phẩm
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>
                        <strong>Sản phẩm</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Số lượng</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Đơn giá</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Thành tiền</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={item.imageUrl} alt={item.itemName} variant="rounded" />
                            <Typography variant="body2">{item.itemName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Tổng cộng</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Cancel Reason if applicable */}
              {selectedOrder.status === 'Cancelled' && selectedOrder.cancelReason && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Lý do hủy
                    </Typography>
                    <Typography variant="body1" color="error">
                      {selectedOrder.cancelReason}
                    </Typography>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedOrder.status === 'Completed' && (
                <Button
                  variant="contained"
                  startIcon={<RestoreIcon />}
                  onClick={() => {
                    handleReorder(selectedOrder);
                    setDetailOpen(false);
                  }}
                >
                  Mua lại
                </Button>
              )}
              <Button onClick={() => setDetailOpen(false)} variant="outlined">
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

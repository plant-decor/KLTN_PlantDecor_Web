'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';

// Mock data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '+84 901 234 567',
    items: 3,
    total: 450000,
    status: 'Completed',
    date: '2025-02-28',
    details: {
      address: '123 Nguyen Hue, Ho Chi Minh City',
      items: [
        { name: 'Monstera Deliciosa', qty: 1, price: 150000 },
        { name: 'Plant Pot', qty: 2, price: 100000 },
        { name: 'Soil Mix', qty: 1, price: 100000 },
      ],
    },
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thu Hà',
    customerPhone: '+84 912 345 678',
    items: 2,
    total: 280000,
    status: 'Shipping',
    date: '2025-03-01',
    details: {
      address: '456 Le Van Sy, Ho Chi Minh City',
      items: [
        { name: 'Philodendron', qty: 1, price: 180000 },
        { name: 'Fertilizer', qty: 1, price: 100000 },
      ],
    },
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Minh Khoa',
    customerPhone: '+84 923 456 789',
    items: 4,
    total: 620000,
    status: 'Pending',
    date: '2025-03-03',
    details: {
      address: '789 Tran Hung Dao, Ho Chi Minh City',
      items: [
        { name: 'Pothos', qty: 2, price: 100000 },
        { name: 'Plant Pot', qty: 2, price: 120000 },
        { name: 'Spray Bottle', qty: 1, price: 50000 },
        { name: 'Soil Mix', qty: 1, price: 250000 },
      ],
    },
  },
];

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Shipping':
      return 'info';
    case 'Pending':
      return 'warning';
    default:
      return 'error';
  }
}

export default function CustomerOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<(typeof MOCK_ORDERS)[0] | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const handleViewDetail = (order: (typeof MOCK_ORDERS)[0]) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customer Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View customer order information to assist with inquiries (Read-only)
        </Typography>
      </Box>

      {/* Info Alert */}
      <Card sx={{ mb: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <LockIcon sx={{ color: 'info.main', mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Read-Only Access
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can view customer orders to assist with inquiries and support decisions. You cannot edit or modify order information.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Items
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_ORDERS.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.customerPhone}</TableCell>
                <TableCell align="center">{order.items}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {order.total.toLocaleString('vi-VN')} VND
                </TableCell>
                <TableCell>
                  <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetail(order)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon fontSize="small" />
          Order Details - {selectedOrder?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <Box>
              {/* Customer Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedOrder.customerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedOrder.customerPhone}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {selectedOrder.details.address}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Items Ordered
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.details.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">{item.qty}</TableCell>
                          <TableCell align="right">{item.price.toLocaleString('vi-VN')} VND</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Order Summary */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Date:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedOrder.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Status:</Typography>
                  <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {selectedOrder.total.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

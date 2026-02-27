'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  Inventory2,
  Warning,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import {
  orderStatusDistribution,
  inventoryStockData,
  storeOperationsStats,
} from '@/data/dashboardMockData';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Format currency in VND
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export default function ManagerStoreOperationsDashboard() {
  // Prepare data for order status pie chart
  const orderStatusData = [
    { id: 0, value: orderStatusDistribution.pending, label: 'Chờ xử lý', color: '#ff9800' },
    { id: 1, value: orderStatusDistribution.processing, label: 'Đang xử lý', color: '#2196f3' },
    { id: 2, value: orderStatusDistribution.shipping, label: 'Đang giao', color: '#9c27b0' },
    { id: 3, value: orderStatusDistribution.completed, label: 'Hoàn thành', color: '#4caf50' },
    { id: 4, value: orderStatusDistribution.cancelled, label: 'Đã hủy', color: '#f44336' },
  ];

  const totalOrders = Object.values(orderStatusDistribution).reduce((a, b) => a + b, 0);

  // Prepare data for inventory scatter chart
  const scatterData = inventoryStockData.map((item) => ({
    x: item.salesVelocity,
    y: item.stockQuantity,
    id: item.productName,
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Vận Hành
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý đơn hàng và tồn kho chi nhánh
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Giá Trị Tồn Kho"
          value={formatCurrency(storeOperationsStats.totalInventoryValue)}
          icon={<Inventory2 sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
        />
        <StatCard
          title="Sản Phẩm Sắp Hết"
          value={storeOperationsStats.lowStockItems}
          icon={<Warning sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
          subtitle="Cần nhập thêm hàng"
        />
        <StatCard
          title="Hết Hàng"
          value={storeOperationsStats.outOfStock}
          icon={<CheckCircle sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
        />
        <StatCard
          title="Thời Gian Xử Lý TB"
          value={`${storeOperationsStats.averageFulfillmentTime} ngày`}
          icon={<AccessTime sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.7fr 1.3fr' }, gap: 3 }}>
        {/* Order Status Pie Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Trạng Thái Đơn Hàng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Phân bổ trạng thái đơn hàng hiện tại
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 350,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChart
                series={[
                  {
                    data: orderStatusData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    innerRadius: 40,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                height={350}
                slotProps={{
                  legend: {
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            </Box>
          </Paper>

        {/* Inventory Scatter Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Phân Tích Tồn Kho vs Tốc Độ Bán
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Cảnh báo mức độ tồn kho (số lượng) so với tốc độ bán (sản phẩm/ngày)
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <ScatterChart
                series={[
                  {
                    data: scatterData,
                    label: 'Sản phẩm',
                    color: '#2196f3',
                  },
                ]}
                xAxis={[
                  {
                    label: 'Tốc độ bán (sp/ngày)',
                  },
                ]}
                yAxis={[
                  {
                    label: 'Số lượng tồn kho',
                  },
                ]}
                height={350}
              />
            </Box>
          </Paper>
      </Box>

      {/* Order Status and Inventory Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        {/* Order Status Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Chi Tiết Trạng Thái Đơn Hàng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thống kê chi tiết từng trạng thái
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#ff9800">
                  {orderStatusDistribution.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Chờ xử lý
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((orderStatusDistribution.pending / totalOrders) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#2196f3">
                  {orderStatusDistribution.processing}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đang xử lý
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((orderStatusDistribution.processing / totalOrders) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e5f5', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                  {orderStatusDistribution.shipping}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đang giao
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((orderStatusDistribution.shipping / totalOrders) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#4caf50">
                  {orderStatusDistribution.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Hoàn thành
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((orderStatusDistribution.completed / totalOrders) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Paper>

        {/* Inventory Details Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cảnh Báo Tồn Kho
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Các sản phẩm cần chú ý
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {inventoryStockData
                .filter((item) => item.stockQuantity < item.reorderPoint * 1.5)
                .map((item) => (
                  <Box
                    key={item.productName}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 1,
                      backgroundColor: item.stockQuantity < item.reorderPoint ? '#ffebee' : '#fff3e0',
                      borderRadius: 1,
                      borderLeft:
                        item.stockQuantity < item.reorderPoint
                          ? '4px solid #f44336'
                          : '4px solid #ff9800',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tốc độ bán: {item.salesVelocity} sp/ngày
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={`${item.stockQuantity} / ${item.reorderPoint}`}
                        size="small"
                        color={item.stockQuantity < item.reorderPoint ? 'error' : 'warning'}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Tồn / Điểm đặt lại
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Paper>
      </Box>
    </Box>
  );
}

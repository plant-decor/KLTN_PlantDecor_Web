'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingBag,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  revenueByWeek,
  managerOrderTrends,
  managerStoreStats,
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

export default function ManagerStoreMetricsDashboard() {
  // Prepare data for weekly revenue chart
  const weekLabels = revenueByWeek.map((item) => item.week);
  const weekRevenues = revenueByWeek.map((item) => item.revenue / 1000000); // Convert to millions

  // Prepare data for order trends line chart
  const orderDates = managerOrderTrends.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const orderCounts = managerOrderTrends.map((item) => item.orders);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Thống Kê Chi Nhánh
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Theo dõi hiệu suất kinh doanh của chi nhánh
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Doanh Thu Chi Nhánh"
          value={formatCurrency(managerStoreStats.totalRevenue)}
          icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
          subtitle={`+${managerStoreStats.growthRate}% so với tháng trước`}
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={managerStoreStats.totalOrders.toLocaleString()}
          icon={<ShoppingBag sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
        />
        <StatCard
          title="Giá Trị TB/Đơn"
          value={formatCurrency(managerStoreStats.averageOrderValue)}
          icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Tăng Trưởng"
          value={`${managerStoreStats.growthRate}%`}
          icon={<Assessment sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="Tháng này"
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Weekly Revenue Comparison */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              So Sánh Doanh Thu Theo Tuần (Triệu VNĐ)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              So sánh doanh thu giữa các tuần trong tháng
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <BarChart
                xAxis={[
                  {
                    data: weekLabels,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: weekRevenues,
                    label: 'Doanh thu (Triệu VNĐ)',
                    color: '#4caf50',
                  },
                ]}
                height={350}
              />
            </Box>
          </Paper>

        {/* Order Trends Line Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Xu Hướng Đơn Hàng Theo Ngày
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Số lượng đơn hàng đặt tại chi nhánh hàng ngày
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <LineChart
                xAxis={[
                  {
                    data: orderDates,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: orderCounts,
                    label: 'Số đơn hàng',
                    color: '#2196f3',
                    area: true,
                  },
                ]}
                height={350}
              />
            </Box>
          </Paper>
      </Box>

      {/* Weekly Performance Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Chi Tiết Hiệu Suất Theo Tuần
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thống kê chi tiết doanh thu và đơn hàng theo tuần
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Tuần
                      </Typography>
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Doanh Thu
                      </Typography>
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Số Đơn Hàng
                      </Typography>
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Giá Trị TB/Đơn
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByWeek.map((week, index) => (
                    <tr
                      key={week.week}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {week.week}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {formatCurrency(week.revenue)}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          {week.orders.toLocaleString()}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <Typography variant="body2">
                          {formatCurrency(week.revenue / week.orders)}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Tổng Cộng
                      </Typography>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {formatCurrency(managerStoreStats.totalRevenue)}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {managerStoreStats.totalOrders.toLocaleString()}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {formatCurrency(managerStoreStats.averageOrderValue)}
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>
    </Box>
  );
}

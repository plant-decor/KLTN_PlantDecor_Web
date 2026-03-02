'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  ShowChart,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  revenueByDate,
  topSellingPlants,
  adminBusinessStats,
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

export default function AdminBusinessDashboard() {
  // Prepare data for revenue line chart
  const revenueDates = revenueByDate.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const revenueValues = revenueByDate.map((item) => item.revenue / 1000000); // Convert to millions

  // Prepare data for top selling plants bar chart
  const plantNames = topSellingPlants.slice(0, 10).map((item) => item.name);
  const purchaseCounts = topSellingPlants.slice(0, 10).map((item) => item.purchaseCount);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Kinh Doanh
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Tổng quan hiệu suất kinh doanh và sản phẩm
      </Typography>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(adminBusinessStats.totalRevenue)}
          icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
          subtitle={`+${adminBusinessStats.growthRate}% so với tháng trước`}
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={adminBusinessStats.totalOrders.toLocaleString()}
          icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
        />
        <StatCard
          title="Giá Trị TB/Đơn"
          value={formatCurrency(adminBusinessStats.averageOrderValue)}
          icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Tăng Trưởng"
          value={`${adminBusinessStats.growthRate}%`}
          icon={<ShowChart sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="Tháng này"
        />
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Revenue Line Chart */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Biến Động Doanh Thu Theo Ngày (Triệu VNĐ)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Theo dõi xu hướng doanh thu hàng ngày trong tháng
          </Typography>
          <Box sx={{ width: '100%', height: 350 }}>
            <LineChart
              xAxis={[
                {
                  data: revenueDates,
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  data: revenueValues,
                  label: 'Doanh thu (Triệu VNĐ)',
                  color: '#4caf50',
                  area: true,
                },
              ]}
              height={350}
            />
          </Box>
        </Paper>

        {/* Top Selling Plants Bar Chart */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top 10 Cây Bán Chạy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Số lượng đã bán
          </Typography>
          <Box sx={{ width: '100%', height: 350 }}>
            <BarChart
              yAxis={[
                {
                  data: plantNames,
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  data: purchaseCounts,
                  label: 'Số lượng bán',
                  color: '#2196f3',
                },
              ]}
              layout="horizontal"
              height={350}
            />
          </Box>
        </Paper>
      </Box>

      {/* Top Plants Details Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Chi Tiết Top Cây Được Yêu Thích
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Thống kê chi tiết về lượt mua, lượt thích và lượt xem
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Xếp Hạng
                  </Typography>
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Tên Cây
                  </Typography>
                </th>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Số Lượt Mua
                  </Typography>
                </th>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Số Lượt Thích
                  </Typography>
                </th>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Số Lượt Xem
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {topSellingPlants.map((plant, index) => (
                <tr
                  key={plant.name}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <Typography variant="body2">#{index + 1}</Typography>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {plant.name}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {plant.purchaseCount.toLocaleString()}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Typography variant="body2">
                      {plant.likeCount.toLocaleString()}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <Typography variant="body2">
                      {plant.viewCount.toLocaleString()}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}

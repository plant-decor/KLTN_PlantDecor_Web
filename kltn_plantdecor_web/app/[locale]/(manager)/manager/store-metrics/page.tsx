'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  managerStoreStats,
  managerRevenueByDate,
  orderStatusDistribution,
  managerTopSellingPlants,
} from '@/data/dashboardMockData';

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
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

// KPI Card Component
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Card sx={{ height: '100%', boxShadow: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function StoreMetricsPage() {
  // Prepare data for Revenue Line Chart
  const revenueDates = managerRevenueByDate.map((item) => formatDate(item.date));
  const revenueValues = managerRevenueByDate.map((item) => item.revenue / 1000000); // Convert to millions

  // Prepare data for Order Status Pie Chart
  const orderStatusData = [
    { id: 'pending', value: orderStatusDistribution.pending, label: 'Chờ xử lý' },
    { id: 'processing', value: orderStatusDistribution.processing, label: 'Đang xử lý' },
    { id: 'shipping', value: orderStatusDistribution.shipping, label: 'Đang giao' },
    { id: 'completed', value: orderStatusDistribution.completed, label: 'Hoàn thành' },
    { id: 'cancelled', value: orderStatusDistribution.cancelled, label: 'Đã hủy' },
  ];

  // Prepare data for Top Selling Plants Bar Chart
  const plantNames = managerTopSellingPlants.map((item) => item.name);
  const plantQuantities = managerTopSellingPlants.map((item) => item.quantity);

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Title */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Thống Kê Cửa Hàng
      </Typography>

      {/* Row 1: KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(managerStoreStats.totalRevenue)}
          icon={<AttachMoneyIcon sx={{ color: '#2e7d32', fontSize: 32 }} />}
          color="#2e7d32"
          subtitle="Tháng này"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={managerStoreStats.totalOrders.toLocaleString()}
          icon={<ShoppingCartIcon sx={{ color: '#1976d2', fontSize: 32 }} />}
          color="#1976d2"
          subtitle="Đơn hàng"
        />
        <StatCard
          title="Giá Trị Trung Bình"
          value={formatCurrency(managerStoreStats.averageOrderValue)}
          icon={<ShowChartIcon sx={{ color: '#ed6c02', fontSize: 32 }} />}
          color="#ed6c02"
          subtitle="Mỗi đơn hàng"
        />
        <StatCard
          title="Tốc Độ Tăng Trưởng"
          value={`+${managerStoreStats.growthRate}%`}
          icon={<TrendingUpIcon sx={{ color: '#9c27b0', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="So với tháng trước"
        />
      </Box>

      {/* Row 2: Revenue Line Chart - Full Width */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Doanh Thu Theo Thời Gian (30 ngày gần nhất)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Biểu đồ xu hướng doanh thu hàng ngày (đơn vị: triệu VNĐ)
          </Typography>
          <LineChart
            xAxis={[
              {
                data: revenueDates,
                scaleType: 'point',
                label: 'Ngày',
              },
            ]}
            series={[
              {
                data: revenueValues,
                label: 'Doanh thu (triệu VNĐ)',
                color: '#2e7d32',
                area: true,
                showMark: true,
              },
            ]}
            height={400}
            margin={{ left: 80, right: 20, top: 20, bottom: 60 }}
            grid={{ vertical: true, horizontal: true }}
          />
        </CardContent>
      </Card>

      {/* Row 3: Order Status Donut Chart (50%) + Top Plants Bar Chart (50%) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Order Status Donut Chart */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tỷ Lệ Trạng Thái Đơn Hàng
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Phân bổ đơn hàng theo trạng thái xử lý
            </Typography>
            <PieChart
              series={[
                {
                  data: orderStatusData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  innerRadius: 60,
                  outerRadius: 140,
                  paddingAngle: 2,
                  cornerRadius: 5,
                },
              ]}
              height={400}
              slotProps={{
                legend: {
                  position: { vertical: 'middle', horizontal: 'end' },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Top Selling Plants Bar Chart */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top 10 Cây Bán Chạy Nhất
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sản phẩm có số lượng bán cao nhất
            </Typography>
            <BarChart
              yAxis={[
                {
                  data: plantNames,
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  data: plantQuantities,
                  label: 'Số lượng đã bán',
                  color: '#1976d2',
                },
              ]}
              layout="horizontal"
              height={400}
              margin={{ left: 150, right: 20, top: 20, bottom: 30 }}
              grid={{ vertical: true }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Additional: Detailed Table for Top Selling Plants */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Chi Tiết Top Cây Bán Chạy
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <strong>Tên Cây</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Số Lượng Bán</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Doanh Thu</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Giá Trung Bình</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {managerTopSellingPlants.map((plant, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { backgroundColor: '#fafafa' },
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    }}
                  >
                    <TableCell>{plant.name}</TableCell>
                    <TableCell align="right">{plant.quantity.toLocaleString()}</TableCell>
                    <TableCell align="right">{formatCurrency(plant.revenue)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(plant.revenue / plant.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

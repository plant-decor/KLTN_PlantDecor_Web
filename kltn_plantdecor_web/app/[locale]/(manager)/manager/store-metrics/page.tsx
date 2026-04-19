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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

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
  const revenueDates = managerRevenueByDate.map((item) => formatDate(item.date));
  const revenueValues = managerRevenueByDate.map((item) => item.revenue / 1000000);

  const orderStatusData = [
    { id: 'pending', value: orderStatusDistribution.pending, label: 'Pending' },
    { id: 'processing', value: orderStatusDistribution.processing, label: 'Processing' },
    { id: 'shipping', value: orderStatusDistribution.shipping, label: 'Shipping' },
    { id: 'completed', value: orderStatusDistribution.completed, label: 'Completed' },
    { id: 'cancelled', value: orderStatusDistribution.cancelled, label: 'Cancelled' },
  ];

  const plantNames = managerTopSellingPlants.map((item) => item.name);
  const plantQuantities = managerTopSellingPlants.map((item) => item.quantity);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Store Metrics
      </Typography>

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
          title="Total Revenue"
          value={formatCurrency(managerStoreStats.totalRevenue)}
          icon={<AttachMoneyIcon sx={{ color: '#2e7d32', fontSize: 32 }} />}
          color="#2e7d32"
          subtitle="This month"
        />
        <StatCard
          title="Total Orders"
          value={managerStoreStats.totalOrders.toLocaleString()}
          icon={<ShoppingCartIcon sx={{ color: '#1976d2', fontSize: 32 }} />}
          color="#1976d2"
          subtitle="Orders"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(managerStoreStats.averageOrderValue)}
          icon={<ShowChartIcon sx={{ color: '#ed6c02', fontSize: 32 }} />}
          color="#ed6c02"
          subtitle="Per order"
        />
        <StatCard
          title="Growth Rate"
          value={`+${managerStoreStats.growthRate}%`}
          icon={<TrendingUpIcon sx={{ color: '#9c27b0', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="Compared to last month"
        />
      </Box>

      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Revenue Over Time (Last 30 Days)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Daily revenue trend (unit: million VND)
          </Typography>
          <LineChart
            xAxis={[
              {
                data: revenueDates,
                scaleType: 'point',
                label: 'Day',
              },
            ]}
            series={[
              {
                data: revenueValues,
                label: 'Revenue (million VND)',
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
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Status Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of orders by processing status
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

        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top 10 Best-Selling Plants
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Products with the highest sales volume
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
                  label: 'Quantity sold',
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

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Best-Selling Plants Details
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>
                    <strong>Plant Name</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Quantity Sold</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Revenue</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Average Price</strong>
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
                    <TableCell align="right">{formatCurrency(plant.revenue / plant.quantity)}</TableCell>
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

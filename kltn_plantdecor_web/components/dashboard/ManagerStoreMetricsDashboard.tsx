'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingBag,
  TrendingUp,
  ErrorOutline,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { Link } from '@/i18n/navigation';
import { CustomLoading } from '@/components/CustomLoading';
import type {
  NurseryFailedOrdersPayload,
  NurseryRevenueSummaryPayload,
  NurseryTopProductItem,
} from '@/types/manager-dashboard.types';
import type { ManagerNurseryOrder } from '@/types/manager-sales-orders.types';
import { formatCurrency } from '@/lib/utils/formatUtil';
import {
  SALES_ORDER_STATUS_CHIP_COLOR,
  SALES_ORDER_STATUS_LABELS,
} from '@/components/manager/sales-orders/managerSalesOrders.constants';

export interface ManagerStoreMetricsDashboardProps {
  revenue: NurseryRevenueSummaryPayload | null;
  failed: NurseryFailedOrdersPayload | null;
  topProducts: NurseryTopProductItem[];
  recentOrders: ManagerNurseryOrder[];
  loading: boolean;
  loadError: string | null;
}

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

export default function ManagerStoreMetricsDashboard({
  revenue,
  failed,
  topProducts,
  recentOrders,
  loading,
  loadError,
}: ManagerStoreMetricsDashboardProps) {
  const totalRevenue = revenue?.totalRevenue ?? 0;
  const totalOrdersInPeriod = revenue?.totalOrders ?? 0;
  const avgOrder =
    totalOrdersInPeriod > 0 ? Math.round(totalRevenue / totalOrdersInPeriod) : 0;
  const totalFailed = failed?.totalFailedOrders ?? 0;

  const plantNames = topProducts.map((p) =>
    p.productName.length > 28 ? `${p.productName.slice(0, 28)}…` : p.productName
  );
  const plantRevenueMillions = topProducts.map((p) =>
    Math.round((p.totalRevenue / 1_000_000) * 100) / 100
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Business Metrics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Revenue and orders for the selected period (API aggregates by period, no daily chart).
      </Typography>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {loading && (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CustomLoading />
        </Box>
      )}

      {!loading && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <StatCard
              title="Total revenue (period)"
              value={formatCurrency(totalRevenue, 'vi-VN')}
              icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
              color="#4caf50"
              subtitle={revenue ? `${revenue.from?.slice(0, 10)} → ${revenue.to?.slice(0, 10)}` : undefined}
            />
            <StatCard
              title="Orders (period revenue)"
              value={totalOrdersInPeriod.toLocaleString('vi-VN')}
              icon={<ShoppingBag sx={{ color: 'white', fontSize: 32 }} />}
              color="#2196f3"
              subtitle="Based on revenue summary"
            />
            <StatCard
              title="Avg. order value"
              value={totalOrdersInPeriod > 0 ? formatCurrency(avgOrder, 'vi-VN') : '—'}
              icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
              color="#ff9800"
              subtitle={totalOrdersInPeriod === 0 ? 'No orders in the period' : undefined}
            />
            <StatCard
              title="Failed deliveries"
              value={totalFailed.toLocaleString('vi-VN')}
              icon={<ErrorOutline sx={{ color: 'white', fontSize: 32 }} />}
              color="#f44336"
              subtitle="For selected period"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top selling products (revenue, million VND)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Top products for the selected period
              </Typography>
              {topProducts.length === 0 ? (
                <Typography color="text.secondary">No data for this period.</Typography>
              ) : (
                <Box sx={{ width: '100%', height: Math.max(280, topProducts.length * 36) }}>
                  <BarChart
                    yAxis={[{ data: plantNames, scaleType: 'band' }]}
                    series={[
                      {
                        data: plantRevenueMillions,
                        label: 'Revenue (million VND)',
                        color: '#2e7d32',
                      },
                    ]}
                    layout="horizontal"
                    height={Math.max(280, topProducts.length * 36)}
                    margin={{ left: 160, right: 24, top: 16, bottom: 24 }}
                    grid={{ vertical: true }}
                  />
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent orders
                </Typography>
                <Link href="/manager/sales-orders" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  View all
                </Link>
              </Box>
              {recentOrders.length === 0 ? (
                <Typography color="text.secondary">No orders yet.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'var(--primary)' }}>
                        <TableCell sx={{ fontWeight: '700' }}>Customer</TableCell>
                        <TableCell align="center" sx={{ fontWeight: '700' }}>Total</TableCell>
                        <TableCell align='center' sx={{ fontWeight: '700' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((o) => {
                        const mappedStatus = o.status as keyof typeof SALES_ORDER_STATUS_LABELS;

                        return (
                          <TableRow key={o.id}>
                            <TableCell>{o.customerName}</TableCell>
                            <TableCell align="center">{formatCurrency(o.totalAmount ?? o.subTotalAmount, 'vi-VN')}</TableCell>
                            <TableCell align='center'>
                              <Chip
                                label={SALES_ORDER_STATUS_LABELS[mappedStatus] || o.statusName || `#${o.status}`}
                                size="small"
                                variant="outlined"
                                color={SALES_ORDER_STATUS_CHIP_COLOR[mappedStatus] || 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top product details
            </Typography>
            {topProducts.length === 0 ? (
              <Typography color="text.secondary">No data available.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead >
                    <TableRow sx={{ backgroundColor: 'var(--primary)' }}>
                      <TableCell sx={{ fontWeight: '700' }}>Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: '700' }}>Quantity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: '700' }}>Revenue</TableCell>
                      <TableCell align="center" sx={{ fontWeight: '700' }}>Avg. price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((p) => (
                      <TableRow key={`${p.productType}-${p.productId}`}>
                        <TableCell>{p.productName}</TableCell>
                        <TableCell align="center">{p.totalQuantity.toLocaleString('vi-VN')}</TableCell>
                        <TableCell align="center">{formatCurrency(p.totalRevenue, 'vi-VN')}</TableCell>
                        <TableCell align="center">
                          {p.totalQuantity > 0
                            ? formatCurrency(Math.round(p.totalRevenue / p.totalQuantity), 'vi-VN')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}

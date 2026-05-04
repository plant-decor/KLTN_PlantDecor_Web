'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Typography,
  TableBody,
} from '@mui/material';
import { TrendingUp, ShoppingCart, AttachMoney, Inventory2 } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAdminBusinessDashboard } from '@/lib/api/admin/useAdminBusinessDashboard';
import { useAdminDataPolling } from '@/lib/hooks/useAdminDataPolling';
import { formatCurrency } from '@/lib/utils/formatUtil';
import ManagementHeader from '../layout/ManagementHeader';
import { hoverLiftStyle, hoverScaleStyle } from '@/lib/styles/buttonStyles';
import { CustomLoading } from '../CustomLoading';

const toInputDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const defaultDateRange = (): { from: string; to: string } => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toInputDateString(startOfMonth), to: toInputDateString(now) };
};

const toApiDateTime = (date: string, endOfDay: boolean): string => {
  return endOfDay ? `${date}T23:59:59` : `${date}T00:00:00`;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', ...hoverScaleStyle }}>
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

const productDisplayName = (p: { productName: string | null; productId: number; productType: string }) => {
  if (p.productName && p.productName.trim()) return p.productName;
  return `#${p.productId} · ${p.productType}`;
};

export default function AdminBusinessDashboard() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const { summary, byNursery, topProducts, loading, error, fetchDashboard, clearError } =
    useAdminBusinessDashboard();

  const load = useCallback(
    async (from: string, to: string) => {
      setRangeError(null);
      clearError();
      if (from > to) {
        setRangeError('Start date must be on or before the end date.');
        return;
      }
      const fromIso = toApiDateTime(from, false);
      const toIso = toApiDateTime(to, true);
      await fetchDashboard(fromIso, toIso, 10);
    },
    [fetchDashboard, clearError]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load(defaults.from, defaults.to);
    }, 0);
    return () => window.clearTimeout(id);
  }, [defaults.from, defaults.to, load]);

  const pollLatest = useCallback(() => {
    void load(dateFrom, dateTo);
  }, [load, dateFrom, dateTo]);

  useAdminDataPolling(pollLatest, loading);

  const totalRevenueTop = useMemo(
    () => topProducts.reduce((acc, p) => acc + (p.totalRevenue ?? 0), 0),
    [topProducts]
  );

  const averageOrderValue =
    summary && summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;

  const nurseryNames = byNursery.map((r) => r.nurseryName || `Nursery #${r.nurseryId}`);
  const nurseryRevenueMillions = byNursery.map((r) => r.revenue / 1_000_000);

  return (
    <Box sx={{ p: 3 }}>
    <ManagementHeader
      title="Business Dashboard"
      description="Revenue by nursery and top-selling products for the selected period"
      entityLabel="Nurseries"
    />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}>
        <TextField
          label="From"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => void load(dateFrom, dateTo)} disabled={loading}
          sx={{...hoverLiftStyle, backgroundColor: 'var(--primary)', fontWeight: 600}}
          >
          Apply
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setDateFrom(defaults.from);
            setDateTo(defaults.to);
            void load(defaults.from, defaults.to);
          }}
          disabled={loading}
          sx={{...hoverLiftStyle, backgroundColor: 'var(--error)', color: '#f5f5f5 !important', fontWeight: 600}}
        >
          Reset
        </Button>
      </Stack>

      {(rangeError || error) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={error ? clearError : undefined}>
          {rangeError || error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CustomLoading size={100} />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <StatCard
          title="Total revenue"
          value={summary ? formatCurrency(summary.totalRevenue, 'en-US') : '—'}
          icon={<AttachMoney sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
          subtitle={summary ? `${summary.from?.slice(0, 10) ?? ''} → ${summary.to?.slice(0, 10) ?? ''}` : undefined}
        />
        <StatCard
          title="Total orders"
          value={summary ? summary.totalOrders.toLocaleString('en-US') : '—'}
          icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
        />
        <StatCard
          title="Avg. order value"
          value={summary && summary.totalOrders > 0 ? formatCurrency(averageOrderValue, 'en-US') : '—'}
          icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Top 10 products revenue"
          value={formatCurrency(totalRevenueTop, 'en-US')}
          icon={<Inventory2 sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle="Combined revenue of ranked products"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2, height: '100%', ...hoverScaleStyle }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Revenue by nursery (millions VND)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Compare nursery revenue for the period
          </Typography>
          {byNursery.length === 0 && !loading ? (
            <Typography color="text.secondary">No revenue-by-nursery data.</Typography>
          ) : (
            <Box sx={{ width: '100%', height: Math.max(280, byNursery.length * 36) }}>
              <BarChart
                yAxis={[{ data: nurseryNames, scaleType: 'band' }]}
                series={[
                  {
                    data: nurseryRevenueMillions,
                    label: 'Revenue (M)',
                    color: '#4caf50',
                  },
                ]}
                layout="horizontal"
                height={Math.max(280, byNursery.length * 36)}
              />
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2, height: '100%', ...hoverScaleStyle }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top products (quantity)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            System data for the selected period
          </Typography>
          {topProducts.length === 0 && !loading ? (
            <Typography color="text.secondary">No top product data yet.</Typography>
          ) : (
            <Box sx={{ width: '100%', height: Math.max(280, topProducts.length * 40) }}>
              <BarChart
                yAxis={[
                  {
                    data: topProducts.map((p) => productDisplayName(p)),
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: topProducts.map((p) => p.totalQuantity),
                    label: 'Sold',
                    color: '#2196f3',
                  },
                ]}
                layout="horizontal"
                height={Math.max(280, topProducts.length * 40)}
              />
            </Box>
          )}
        </Paper>
      </Box>

      <Paper sx={{ p: 2, ...hoverScaleStyle }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Top products detail
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Quantity and revenue per line
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                    ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                    Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                    Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                    Revenue
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProducts.map((p, index) => (
                <TableRow
                  key={`${p.productType}-${p.productId}-${index}`}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                  }}
                >
                  <TableCell style={{ padding: '12px' }}>
                    <Typography variant="body2">{index + 1}</Typography>
                  </TableCell>
                  <TableCell style={{ padding: '12px' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {productDisplayName(p)}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ padding: '12px', textAlign: 'center' }}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {p.totalQuantity.toLocaleString('en-US')}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ padding: '12px', textAlign: 'center' }}>
                    <Typography variant="body2">{formatCurrency(p.totalRevenue, 'vi-VN')}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        {topProducts.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No records.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WarningAmber, ShoppingBag, Inventory, Summarize } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAdminSystemDashboard } from '@/lib/api/admin/useAdminSystemDashboard';
import { useAdminDataPolling } from '@/lib/hooks/useAdminDataPolling';
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

const FALLBACK_STATUS_COLOR = '#607d8b';

const normalizeStatusKey = (name: string) => name.trim().toLowerCase();

/** Accent for order status (pie + breakdown). Failed / Completed use design tokens. */
const getOrderStatusAccent = (item: { status: number; statusName: string }): string => {
  const key = normalizeStatusKey(item.statusName);
  if (key === 'failed') return 'var(--error)';
  if (key === 'completed') return 'var(--primary)';
  if (key === 'cancelled' || key === 'canceled') return '#64748b';
  if (key === 'pending') return 'var(--warning)';
  if (key === 'delivered') return 'var(--success)';
  if (key === 'assigned') return '#2563eb';

  switch (item.status) {
    case 9:
      return 'var(--error)';
    case 7:
      return 'var(--primary)';
    case 8:
      return '#64748b';
    case 0:
      return 'var(--warning)';
    case 5:
      return 'var(--success)';
    case 3:
      return '#2563eb';
    default:
      return FALLBACK_STATUS_COLOR;
  }
};

const statusRowSoftBackground = (accent: string): string =>
  accent.startsWith('var(')
    ? `color-mix(in srgb, ${accent} 22%, transparent)`
    : alpha(accent, 0.14);

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

const productLabel = (row: { productName: string | null; productId: number; productType: string }) => {
  if (row.productName && row.productName.trim()) return row.productName;
  return `#${row.productId} (${row.productType})`;
};

export default function AdminSystemDashboard() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [thresholdInput, setThresholdInput] = useState('10');
  const [threshold, setThreshold] = useState(10);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const { lowStock, orderStatus, failedOrders, loading, error, fetchDashboard, clearError } =
    useAdminSystemDashboard();

  const load = useCallback(
    async (from: string, to: string, thr: number) => {
      setRangeError(null);
      clearError();
      if (from > to) {
        setRangeError('Start date must be on or before the end date.');
        return;
      }
      const fromIso = toApiDateTime(from, false);
      const toIso = toApiDateTime(to, true);
      await fetchDashboard(fromIso, toIso, thr);
    },
    [fetchDashboard, clearError]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load(defaults.from, defaults.to, 10);
    }, 0);
    return () => window.clearTimeout(id);
  }, [defaults.from, defaults.to, load]);

  const pollLatest = useCallback(() => {
    void load(dateFrom, dateTo, threshold);
  }, [load, dateFrom, dateTo, threshold]);

  useAdminDataPolling(pollLatest, loading);

  const totalOrdersInRange = useMemo(() => {
    if (!orderStatus?.items?.length) return 0;
    return orderStatus.items.reduce((s, i) => s + i.totalOrders, 0);
  }, [orderStatus]);

  const pieData = useMemo(() => {
    if (!orderStatus?.items?.length) return [];
    return orderStatus.items
      .filter((i) => i.totalOrders > 0)
      .map((item) => ({
        id: item.status,
        value: item.totalOrders,
        label: item.statusName,
        color: getOrderStatusAccent(item),
      }));
  }, [orderStatus]);

  const sortedLowStock = useMemo(() => {
    return [...lowStock].sort((a, b) => a.availableQuantity - b.availableQuantity);
  }, [lowStock]);

  const handleApplyDates = () => {
    const t = parseInt(thresholdInput, 10);
    if (Number.isNaN(t) || t < 0) {
      setRangeError('Low-stock threshold must be a non-negative number.');
      return;
    }
    setThreshold(t);
    void load(dateFrom, dateTo, t);
  };

  const handleReset = () => {
    setDateFrom(defaults.from);
    setDateTo(defaults.to);
    setThresholdInput('10');
    setThreshold(10);
    void load(defaults.from, defaults.to, 10);
  };

  return (
    <Box sx={{ p: 3 }}>
      <ManagementHeader
        title="System Dashboard"
        description="Orders by status and system-wide low-stock alerts"
        entityLabel="Orders"
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
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
        <TextField
          label="Low-stock threshold"
          type="number"
          size="small"
          value={thresholdInput}
          onChange={(e) => setThresholdInput(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: 160 }}
        />
        <Button variant="contained" onClick={handleApplyDates} disabled={loading} sx={{...hoverLiftStyle, backgroundColor: 'var(--primary)', fontWeight: 600}}>
          Apply
        </Button>
        <Button variant="outlined" onClick={handleReset} disabled={loading} sx={{...hoverLiftStyle, backgroundColor: 'var(--error)', color: '#f5f5f5 !important', fontWeight: 600}}>
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
          title="Total orders (by status)"
          value={totalOrdersInRange.toLocaleString('en-US')}
          icon={<Summarize sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
          subtitle="For the selected date range"
        />
        <StatCard
          title="Failed deliveries"
          value={failedOrders?.totalFailedOrders?.toLocaleString('en-US') ?? '—'}
          icon={<WarningAmber sx={{ color: 'white', fontSize: 32 }} />}
          color="#f44336"
        />
        <StatCard
          title="Low-stock rows"
          value={lowStock.length.toLocaleString('en-US')}
          icon={<Inventory sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
          subtitle={`Below threshold ${threshold}`}
        />
        <StatCard
          title="Distinct statuses"
          value={orderStatus?.items?.length?.toLocaleString('en-US') ?? '—'}
          icon={<ShoppingBag sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 2, ...hoverScaleStyle }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Orders by status
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Order counts for the period
          </Typography>
          {pieData.length === 0 && !loading ? (
            <Typography color="text.secondary">No order status data.</Typography>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
              <PieChart
                series={[
                  {
                    data: pieData,
                    innerRadius: 40,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 4,
                  },
                ]}
                height={360}
                slotProps={{
                  legend: { position: { vertical: 'bottom', horizontal: 'center' } },
                }}
              />
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2, ...hoverScaleStyle }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Status breakdown
          </Typography>
          <Stack spacing={1.5}>
            {(orderStatus?.items ?? []).map((item) => {
              const accent = getOrderStatusAccent(item);
              return (
                <Box
                  key={item.status}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 1,
                    borderLeft: `4px solid ${accent}`,
                    bgcolor: statusRowSoftBackground(accent),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: accent,
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                    <Typography variant="body2" fontWeight={600} noWrap title={item.statusName}>
                      {item.statusName}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold" sx={{ flexShrink: 0, pl: 1 }}>
                    {item.totalOrders.toLocaleString('en-US')}
                  </Typography>
                </Box>
              );
            })}
            {(!orderStatus?.items || orderStatus.items.length === 0) && !loading && (
              <Typography color="text.secondary">No items.</Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, ...hoverScaleStyle }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Low stock (system-wide)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Rows below threshold {threshold}, sorted by available quantity (ascending)
        </Typography>
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  // stickyHeader applies an opaque bg on each th; TableHead alone is covered
                  '& th': {
                    backgroundColor: 'var(--primary)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>Nursery</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Product type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Reserved
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Available
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedLowStock.map((row, idx) => {
                return (
                  <TableRow
                    key={`${row.nurseryId}-${row.productType}-${row.productId}-${idx}`}
                  >
                    {/* <TableCell align="right">{row.productId}</TableCell> */}
                    <TableCell>{row.nurseryName}</TableCell>
                    <TableCell>{row.productType}</TableCell>
                    <TableCell>{productLabel(row)}</TableCell>
                    <TableCell align="center">{row.totalQuantity}</TableCell>
                    <TableCell align="center">{row.reservedQuantity}</TableCell>
                    <TableCell align="center">{row.availableQuantity}</TableCell>
                    {/* <TableCell align="right">{row.threshold}</TableCell> */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {sortedLowStock.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No products below the threshold.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

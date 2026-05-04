'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
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
import { useAdminRevenue } from '@/lib/api/admin/useAdminRevenue';
import { useAdminDataPolling } from '@/lib/hooks/useAdminDataPolling';
import ManagementHeader from '../layout/ManagementHeader';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDateTimeLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function AdminRevenuePageClient() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const { summary, byNursery, loading, error, fetchRevenue, clearError } = useAdminRevenue();

  const load = useCallback(
    async (from: string, to: string) => {
      setRangeError(null);
      clearError();
      if (from > to) {
        setRangeError('Start date must be before or equal to end date.');
        return;
      }
      const fromIso = toApiDateTime(from, false);
      const toIso = toApiDateTime(to, true);
      await fetchRevenue(fromIso, toIso);
    },
    [fetchRevenue, clearError]
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

  const handleApply = () => {
    void load(dateFrom, dateTo);
  };

  const handleReset = () => {
    setDateFrom(defaults.from);
    setDateTo(defaults.to);
    void load(defaults.from, defaults.to);
  };

  const handleRetry = () => {
    void load(dateFrom, dateTo);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <ManagementHeader
        title="Store Payment"
        description="System revenue summary and breakdown by nursery for the selected period."
        entityLabel="Nurseries"
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button fullWidth variant="contained" onClick={handleApply} disabled={loading}
            sx={{...hoverLiftStyle, backgroundColor: 'var(--primary)', fontWeight: 600}}
            >
              Apply
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button fullWidth variant="outlined" color="secondary" onClick={handleReset} disabled={loading}
            sx={{...hoverLiftStyle, backgroundColor: 'var(--error)', color: '#f5f5f5 !important', fontWeight: 600}}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {rangeError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setRangeError(null)}>
          {rangeError}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {loading && summary && <LinearProgress sx={{ mb: 2 }} />}

      {loading && !summary ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CustomLoading size={100} />
        </Box>
      ) : (
        <>
          {summary && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Period (API)
                </Typography>
                <Typography variant="body2">
                  {formatDateTimeLabel(summary.from)} — {formatDateTimeLabel(summary.to)}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total revenue
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(summary.totalRevenue)}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total orders
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {summary.totalOrders}
                </Typography>
              </Paper>
            </Stack>
          )}

          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Revenue by nursery
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
            <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nursery</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Orders</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {byNursery.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No nursery revenue in this period.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  byNursery.map((row) => (
                    <TableRow key={row.nurseryId}>
                      <TableCell>{row.nurseryId}</TableCell>
                      <TableCell>{row.nurseryName}</TableCell>
                      <TableCell align="center">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell align="center">{row.totalOrders}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

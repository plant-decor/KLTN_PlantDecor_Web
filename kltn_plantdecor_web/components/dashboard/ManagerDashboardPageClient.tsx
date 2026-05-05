'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminDataPolling } from '@/lib/hooks/useAdminDataPolling';
import {
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ManagerStoreMetricsDashboard from '@/components/dashboard/ManagerStoreMetricsDashboard';
import ManagerStoreOperationsDashboard from '@/components/dashboard/ManagerStoreOperationsDashboard';
import {
  getManagerNurseryFailedOrdersSummary,
  getManagerNurseryOrderStatusSummary,
  getManagerNurseryOrders,
  getManagerNurseryRevenueSummary,
} from '@/lib/api/managerSalesOrdersService';
import {
  getManagerNurseryTopProducts,
  getMyNurseryMaterialSummary,
} from '@/lib/api/managerNurseryDashboardService';
import { getMyNurseryExpiringSoonMaterials, getNurseryInventoryLowStock } from '@/lib/api/managerNurseryInventoryService';
import type { ExpiringSoonMaterialItem, LowStockProductItem } from '@/types/manager-store-catalog.types';
import type {
  MyNurseryMaterialSummaryPayload,
  NurseryFailedOrdersPayload,
  NurseryOrderStatusSummaryPayload,
  NurseryRevenueSummaryPayload,
  NurseryTopProductItem,
} from '@/types/manager-dashboard.types';
import type { ManagerNurseryOrder } from '@/types/manager-sales-orders.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import ManagementHeader from '../layout/ManagementHeader';

const toYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const startOfCurrentMonth = (): string => {
  const d = new Date();
  return toYmd(new Date(d.getFullYear(), d.getMonth(), 1));
};

const todayYmd = (): string => toYmd(new Date());

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }
  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return candidate.response?.data?.message || candidate.message || fallback;
};

const unwrapExpiring = (response: { payload?: ExpiringSoonMaterialItem[]; data?: ExpiringSoonMaterialItem[] }) => {
  return response.payload ?? response.data ?? [];
};

export default function ManagerDashboardPageClient() {
  const [currentTab, setCurrentTab] = useState(0);
  const [fromDate, setFromDate] = useState(startOfCurrentMonth);
  const [toDate, setToDate] = useState(todayYmd);
  const [appliedFrom, setAppliedFrom] = useState(startOfCurrentMonth);
  const [appliedTo, setAppliedTo] = useState(todayYmd);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiringDaysAhead, setExpiringDaysAhead] = useState(30);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<NurseryRevenueSummaryPayload | null>(null);
  const [failed, setFailed] = useState<NurseryFailedOrdersPayload | null>(null);
  const [topProducts, setTopProducts] = useState<NurseryTopProductItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<ManagerNurseryOrder[]>([]);
  const [statusSummary, setStatusSummary] = useState<NurseryOrderStatusSummaryPayload | null>(null);
  const [materialSummary, setMaterialSummary] = useState<MyNurseryMaterialSummaryPayload | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockProductItem[]>([]);
  const [expiringMaterials, setExpiringMaterials] = useState<ExpiringSoonMaterialItem[]>([]);

  const fromIso = useMemo(() => `${appliedFrom}T00:00:00`, [appliedFrom]);
  const toIso = useMemo(() => `${appliedTo}T23:59:59`, [appliedTo]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [
        revenueRes,
        failedRes,
        topRes,
        ordersRes,
        statusRes,
        materialRes,
        lowStockRes,
        expiringRes,
      ] = await Promise.all([
        getManagerNurseryRevenueSummary(fromIso, toIso, false),
        getManagerNurseryFailedOrdersSummary(fromIso, toIso, false),
        getManagerNurseryTopProducts(fromIso, toIso, 10, false),
        getManagerNurseryOrders({ pageNumber: 1, pageSize: 5 }, false),
        getManagerNurseryOrderStatusSummary(fromIso, toIso, false),
        getMyNurseryMaterialSummary(lowStockThreshold, expiringDaysAhead, false),
        getNurseryInventoryLowStock(lowStockThreshold, false),
        getMyNurseryExpiringSoonMaterials(expiringDaysAhead, false),
      ]);

      setRevenue(revenueRes);
      setFailed(failedRes);
      setTopProducts(topRes ?? []);
      setRecentOrders(ordersRes?.items ?? []);
      setStatusSummary(statusRes);
      setMaterialSummary(materialRes);
      setLowStockItems(lowStockRes ?? []);
      setExpiringMaterials(unwrapExpiring(expiringRes));
    } catch (e) {
      setLoadError(getErrorMessage(e, 'Unable to load dashboard data.'));
      setRevenue(null);
      setFailed(null);
      setTopProducts([]);
      setRecentOrders([]);
      setStatusSummary(null);
      setMaterialSummary(null);
      setLowStockItems([]);
      setExpiringMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [fromIso, toIso, lowStockThreshold, expiringDaysAhead]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const pollLatest = useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useAdminDataPolling(pollLatest, loading);

  const handleApplyRange = () => {
    if (fromDate > toDate) {
      setLoadError('Start date cannot be after end date.');
      return;
    }
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <ManagementHeader
          title="Nursery Dashboard"
          description="Choose a time range for order, revenue, and top product statistics. Inventory and materials are filtered using the thresholds below."
          entityLabel="Nurseries"
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            label="From date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Low stock threshold"
            type="number"
            size="small"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Math.max(0, Number(e.target.value) || 0))}
            sx={{ width: 140 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Expiring materials (days)"
            type="number"
            size="small"
            value={expiringDaysAhead}
            onChange={(e) => setExpiringDaysAhead(Math.max(1, Number(e.target.value) || 30))}
            sx={{ width: 180 }}
            inputProps={{ min: 1 }}
          />
          <Button variant="contained" onClick={handleApplyRange} sx={{...hoverLiftStyle, backgroundColor: 'var(--primary)', fontWeight: 600}}>
            Apply date range
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Filtered: {appliedFrom} → {appliedTo}
        </Typography>
      </Paper>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
      >
        <Tab label="Business" />
        <Tab label="Operations" />
      </Tabs>
      <Box>
        {currentTab === 0 && (
          <ManagerStoreMetricsDashboard
            revenue={revenue}
            failed={failed}
            topProducts={topProducts}
            recentOrders={recentOrders}
            loading={loading}
            loadError={loadError}
          />
        )}
        {currentTab === 1 && (
          <ManagerStoreOperationsDashboard
            statusSummary={statusSummary}
            failed={failed}
            materialSummary={materialSummary}
            lowStockItems={lowStockItems}
            expiringMaterials={expiringMaterials}
            loading={loading}
            loadError={loadError}
          />
        )}
      </Box>
    </Box>
  );
}

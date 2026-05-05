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
  Inventory2,
  LocalFlorist,
  Grass,
  ErrorOutline,
  Schedule,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { CustomLoading } from '@/components/CustomLoading';
import type { ExpiringSoonMaterialItem, LowStockProductItem } from '@/types/manager-store-catalog.types';
import type {
  MyNurseryMaterialSummaryPayload,
  NurseryFailedOrdersPayload,
  NurseryOrderStatusSummaryPayload,
} from '@/types/manager-dashboard.types';
import { formatDateTime } from '@/lib/utils/dateUtils';

const PIE_COLORS = ['#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#f44336', '#00bcd4', '#795548', '#607d8b'];

export interface ManagerStoreOperationsDashboardProps {
  statusSummary: NurseryOrderStatusSummaryPayload | null;
  failed: NurseryFailedOrdersPayload | null;
  materialSummary: MyNurseryMaterialSummaryPayload | null;
  lowStockItems: LowStockProductItem[];
  expiringMaterials: ExpiringSoonMaterialItem[];
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

export default function ManagerStoreOperationsDashboard({
  statusSummary,
  failed,
  materialSummary,
  lowStockItems,
  expiringMaterials,
  loading,
  loadError,
}: ManagerStoreOperationsDashboardProps) {
  const items = statusSummary?.items ?? [];
  const totalByStatus = items.reduce((acc, it) => acc + it.totalOrders, 0);
  const pieData = items.map((it, index) => ({
    id: it.status,
    value: it.totalOrders,
    label: it.statusName,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  const cp = materialSummary?.commonPlants;
  const pi = materialSummary?.plantInstances;
  const mat = materialSummary?.materials;
  const totalFailed = failed?.totalFailedOrders ?? 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Operations & Inventory
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Order status for the period, inventory overview, and low-stock / expiry alerts.
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
              title="Common products (items)"
              value={cp?.totalProducts?.toLocaleString('vi-VN') ?? '—'}
              icon={<Grass sx={{ color: 'white', fontSize: 32 }} />}
              color="#2e7d32"
              subtitle={`Available stock: ${cp?.totalAvailableQuantity?.toLocaleString('vi-VN') ?? '—'}`}
            />
            <StatCard
              title="Identified plants (instances)"
              value={pi?.totalInstances?.toLocaleString('vi-VN') ?? '—'}
              icon={<LocalFlorist sx={{ color: 'white', fontSize: 32 }} />}
              color="#7b1fa2"
              subtitle={`Low stock (summary): ${pi?.lowStockPlants?.toLocaleString('vi-VN') ?? '—'}`}
            />
            <StatCard
              title="Materials (items)"
              value={mat?.totalProducts?.toLocaleString('vi-VN') ?? '—'}
              icon={<Inventory2 sx={{ color: 'white', fontSize: 32 }} />}
              color="#1565c0"
              subtitle={`Expiring soon: ${mat?.expiringSoonProducts?.toLocaleString('vi-VN') ?? '—'}`}
            />
            <StatCard
              title="Failed orders (period)"
              value={totalFailed.toLocaleString('vi-VN')}
              icon={<ErrorOutline sx={{ color: 'white', fontSize: 32 }} />}
              color="#c62828"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.85fr 1.15fr' }, gap: 3, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Orders by status (period)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {totalByStatus === 0 ? 'No orders in this period.' : `Total ${totalByStatus.toLocaleString('vi-VN')} orders`}
              </Typography>
              {totalByStatus > 0 && pieData.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                        innerRadius: 48,
                        outerRadius: 120,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={360}
                    slotProps={{
                      legend: {
                        position: { vertical: 'middle', horizontal: 'end' },
                      },
                    }}
                  />
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Status details
              </Typography>
              {items.length === 0 ? (
                <Typography color="text.secondary">No data available.</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {items.map((it, index) => {
                    const pct = totalByStatus > 0 ? ((it.totalOrders / totalByStatus) * 100).toFixed(1) : '0';
                    const bg = `${PIE_COLORS[index % PIE_COLORS.length]}18`;
                    return (
                      <Box key={it.status} sx={{ textAlign: 'center', p: 2, backgroundColor: bg, borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold">
                          {it.totalOrders.toLocaleString('vi-VN')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {it.statusName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pct}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {materialSummary && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {materialSummary.nurseryName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Summary updated: {formatDateTime(materialSummary.generatedAt)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Low-stock products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on the selected low-stock threshold (API low-stock).
              </Typography>
              <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                {lowStockItems.length === 0 ? (
                  <Typography color="text.secondary">No products below threshold.</Typography>
                ) : (
                  lowStockItems.map((item) => (
                    <Box
                      key={`${item.productType}-${item.productId}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        mb: 1,
                        backgroundColor: '#fff3e0',
                        borderRadius: 1,
                        borderLeft: '4px solid #ff9800',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.productType} 
                        </Typography>
                      </Box>
                      <Chip
                        label={`KD: ${item.availableQuantity} / ${item.totalQuantity}`}
                        size="small"
                        color="warning"
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Schedule color="action" />
                <Typography variant="h6" fontWeight="bold">
                  Materials expiring soon
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Within the selected date range
              </Typography>
              {expiringMaterials.length === 0 ? (
                <Typography color="text.secondary">No materials in the expiry window.</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 360 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Material</TableCell>
                        <TableCell align="right">Days left</TableCell>
                        <TableCell align="right">Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiringMaterials.map((row) => (
                        <TableRow key={row.nurseryMaterialId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.materialName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.materialCode}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{row.daysToExpire}</TableCell>
                          <TableCell align="right">{row.availableQuantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}

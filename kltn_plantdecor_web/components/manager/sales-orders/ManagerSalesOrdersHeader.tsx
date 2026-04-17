'use client';

import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ManagerNurseryOrderStatus } from '@/types/manager-sales-orders.types';
import { ALL_STATUS_FILTER, SALES_ORDER_STATUS_OPTIONS } from './managerSalesOrders.constants';

interface ManagerSalesOrdersHeaderProps {
  statusFilter: typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus;
  totalCount: number;
  loading: boolean;
  onStatusFilterChange: (value: typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus) => void;
  onRefresh: () => void;
}

export default function ManagerSalesOrdersHeader({
  statusFilter,
  totalCount,
  loading,
  onStatusFilterChange,
  onRefresh,
}: ManagerSalesOrdersHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Đơn hàng bán
        </Typography>
        <Typography color="text.secondary">Quản lý đơn hàng thuộc vườn của bạn</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Tổng đơn: <strong>{totalCount}</strong>
        </Typography>

        <FormControl size="small" sx={{ minWidth: 230 }}>
          <InputLabel id="manager-sales-order-status-label">Trạng thái</InputLabel>
          <Select
            labelId="manager-sales-order-status-label"
            value={statusFilter}
            label="Trạng thái"
            onChange={(event) =>
              onStatusFilterChange(event.target.value as typeof ALL_STATUS_FILTER | ManagerNurseryOrderStatus)
            }
          >
            {SALES_ORDER_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={onRefresh}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Stack>
    </Stack>
  );
}

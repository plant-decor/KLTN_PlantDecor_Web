'use client';

import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
import type { SelectChangeEvent } from '@mui/material/Select';
import { SALES_ORDER_STATUS_OPTIONS } from './managerSalesOrders.constants';
import ManagementHeader from '@/components/layout/ManagementHeader';

interface ManagerSalesOrdersHeaderProps {
  totalCount: number;
  statusFilter: number;
  loading: boolean;
  onStatusFilterChange: (value: number) => void;
  onRefresh: () => void;
}

export default function ManagerSalesOrdersHeader({
  totalCount,
  statusFilter,
  // loading,
  onStatusFilterChange,
  // onRefresh,
}: ManagerSalesOrdersHeaderProps) {
  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    onStatusFilterChange(Number(event.target.value));
  };

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="manager-sales-order-status-label">Status</InputLabel>
          <Select
            labelId="manager-sales-order-status-label"
            value={statusFilter}
            label="Status"
            onChange={handleStatusChange}
          >
            {SALES_ORDER_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

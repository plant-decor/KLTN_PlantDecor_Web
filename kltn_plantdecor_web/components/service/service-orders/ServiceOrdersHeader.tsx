'use client';

import { Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ServiceStatusFilterValue, ServiceStatusOption } from './managerServiceOrders.constants';

interface ServiceOrdersHeaderProps {
  statusFilter: ServiceStatusFilterValue;
  statusOptions: ServiceStatusOption[];
  activeFilterLabel: string;
  pendingCount: number;
  awaitingPaymentCount: number;
  activeCount: number;
  loading: boolean;
  onStatusFilterChange: (value: ServiceStatusFilterValue) => void;
  onRefresh: () => void;
}

export default function ServiceOrdersHeader({
  statusFilter,
  statusOptions,
  activeFilterLabel,
  pendingCount,
  awaitingPaymentCount,
  activeCount,
  loading,
  onStatusFilterChange,
  onRefresh,
}: ServiceOrdersHeaderProps) {
  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="service-order-status-filter">Status</InputLabel>
          <Select
            labelId="service-order-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(event) => {
              onStatusFilterChange(event.target.value as ServiceStatusFilterValue);
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={String(option.value)} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
          Reload
        </Button>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <Chip label={`Filter: ${activeFilterLabel}`} variant="outlined" />
          <Chip label={`Pending: ${pendingCount}`} variant="outlined" />
          <Chip label={`Awaiting payment: ${awaitingPaymentCount}`} variant="outlined" />
          <Chip label={`Active: ${activeCount}`} variant="outlined" />
        </Stack>
      </Stack>
    </>
  );
}

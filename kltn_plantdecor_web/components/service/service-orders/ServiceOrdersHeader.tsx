'use client';

import { Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ServiceRegistrationStatusEnum } from '@/types/care-service.types';
import { ALL_STATUS_FILTER, SERVICE_STATUS_OPTIONS } from './managerServiceOrders.constants';

interface ServiceOrdersHeaderProps {
  statusFilter: typeof ALL_STATUS_FILTER | ServiceRegistrationStatusEnum;
  activeFilterLabel: string;
  pendingCount: number;
  awaitingPaymentCount: number;
  activeCount: number;
  loading: boolean;
  onStatusFilterChange: (value: typeof ALL_STATUS_FILTER | ServiceRegistrationStatusEnum) => void;
  onRefresh: () => void;
}

export default function ServiceOrdersHeader({
  statusFilter,
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
        <Chip color="warning" variant="outlined" label={`Pending: ${pendingCount}`} />
        <Chip color="info" variant="outlined" label={`Awaiting payment: ${awaitingPaymentCount}`} />
        <Chip color="success" variant="outlined" label={`Active: ${activeCount}`} />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="service-order-status-filter">Status</InputLabel>
          <Select
            labelId="service-order-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(event) => {
              onStatusFilterChange(event.target.value as typeof ALL_STATUS_FILTER | ServiceRegistrationStatusEnum);
            }}
          >
            {SERVICE_STATUS_OPTIONS.map((option) => (
              <MenuItem key={String(option.value)} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
          Reload
        </Button>

        <Chip label={`Filter: ${activeFilterLabel}`} variant="outlined" />
      </Stack>
    </>
  );
}

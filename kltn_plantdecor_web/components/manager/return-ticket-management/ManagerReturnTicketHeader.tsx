'use client';

import { Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RETURN_TICKET_ASSIGNMENT_STATUS_OPTIONS } from './managerReturnTicket.constants';

interface ManagerReturnTicketHeaderProps {
  totalCount: number;
  statusFilter: number;
  loading: boolean;
  onStatusFilterChange: (value: number) => void;
  onRefresh: () => void;
}

export default function ManagerReturnTicketHeader({
  totalCount,
  statusFilter,
  loading,
  onStatusFilterChange,
  onRefresh,
}: ManagerReturnTicketHeaderProps) {
  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    onStatusFilterChange(Number(event.target.value));
  };

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <div>
          <Typography variant="h6" fontWeight={700}>
            Return Ticket Management
          </Typography>
          <Typography color="text.secondary">Review and process assigned return tickets</Typography>
        </div>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Total assignments: <strong>{totalCount}</strong>
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 280 }}>
        <InputLabel id="manager-return-ticket-status-label">Assignment Status</InputLabel>
        <Select
          labelId="manager-return-ticket-status-label"
          value={statusFilter}
          label="Assignment Status"
          onChange={handleStatusChange}
        >
          {RETURN_TICKET_ASSIGNMENT_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

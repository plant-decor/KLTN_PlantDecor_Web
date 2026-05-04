'use client';

import {FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { RETURN_TICKET_ASSIGNMENT_STATUS_OPTIONS } from './managerReturnTicket.constants';

interface ManagerReturnTicketHeaderProps {
  totalCount: number;
  statusFilter: number;
  loading: boolean;
  onStatusFilterChange: (value: number) => void;
  onRefresh: () => void;
}

export default function ManagerReturnTicketHeader({
  statusFilter,
  onStatusFilterChange,
}: ManagerReturnTicketHeaderProps) {
  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    onStatusFilterChange(Number(event.target.value));
  };

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <FormControl size="small" sx={{ maxWidth: 260 }}>
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

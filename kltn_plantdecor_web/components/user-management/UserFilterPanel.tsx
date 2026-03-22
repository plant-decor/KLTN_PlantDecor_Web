'use client';

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import type { UserRole } from '@/lib/constants/header';
import { ROLE_OPTIONS } from '@/lib/user-management/constants';

interface UserFilterPanelProps {
  searchTerm: string;
  roleFilter: UserRole | '';
  statusFilter: 'active' | 'inactive' | '';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | '') => void;
  onStatusFilterChange: (value: 'active' | 'inactive' | '') => void;
}

export default function UserFilterPanel({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
}: UserFilterPanelProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label="Search (Email, Name, Phone)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            placeholder="Type to search..."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => onRoleFilterChange((e.target.value as UserRole) || '')}
            >
              <MenuItem value="">All Roles</MenuItem>
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                onStatusFilterChange((e.target.value as 'active' | 'inactive') || '')
              }
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}

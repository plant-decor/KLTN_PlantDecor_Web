'use client';

import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Edit, ToggleOn as ToggleOnIcon, ToggleOff as ToggleOffIcon } from '@mui/icons-material';
import type { AdminNursery } from '@/types/admin-nursery.types';
import { formatDateTime } from '@/lib/utils/dateUtils';

interface NurseryTableProps {
  nurseries: AdminNursery[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onEdit: (nursery: AdminNursery) => void;
  onToggleActive: (nursery: AdminNursery) => void;
}

export default function NurseryTable({
  nurseries,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onToggleActive,
}: NurseryTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nursery Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Loading data...</Typography>
                </TableCell>
              </TableRow>
            ) : nurseries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No nursery data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              nurseries.map((nursery) => (
                <TableRow key={nursery.id} hover>
                  <TableCell>{nursery.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{nursery.name}</TableCell>
                  <TableCell>{nursery.managerName || '-'}</TableCell>
                  <TableCell>{nursery.address}</TableCell>
                  <TableCell>{nursery.phone || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={nursery.isActive ? 'Active' : 'Inactive'}
                      color={nursery.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(nursery.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit nursery">
                        <IconButton size="small" color="primary" onClick={() => onEdit(nursery)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={nursery.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={nursery.isActive ? 'success' : 'default'}
                          onClick={() => onToggleActive(nursery)}
                        >
                          {nursery.isActive ? (
                            <ToggleOnIcon fontSize="small" />
                          ) : (
                            <ToggleOffIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize}
          page={Math.max(pageNumber - 1, 0)}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
        />
      </TableContainer>
    </Box>
  );
}

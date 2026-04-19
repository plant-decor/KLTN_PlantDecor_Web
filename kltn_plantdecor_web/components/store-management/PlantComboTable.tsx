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
import {
  Edit,
  Visibility,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import type { PlantCombo } from '@/types/store-management.types';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface PlantComboTableProps {
  combos: PlantCombo[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onEdit: (combo: PlantCombo) => void;
  onToggleActive: (combo: PlantCombo) => void;
  onView: (combo: PlantCombo) => void;
}

export default function PlantComboTable({
  combos,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onToggleActive,
  onView,
}: PlantComboTableProps) {
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
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              {/* <TableCell sx={{ fontWeight: 600 }}>Mã combo</TableCell> */}
              <TableCell sx={{ fontWeight: 600 }}>Combo name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Season</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Combo Price
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Total Items
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No Data</Typography>
                </TableCell>
              </TableRow>
            ) : (
              combos.map((combo) => (
                <TableRow key={combo.id} hover>
                  <TableCell>{combo.id}</TableCell>
                  <TableCell>
                    <Image
                      src={combo.primaryImageUrl || '/img/fallbackplant.avif'}
                      alt={combo.comboName}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </TableCell>
                  {/* <TableCell sx={{ fontWeight: 600 }}>{combo.comboCode}</TableCell> */}
                  <TableCell>{combo.comboName}</TableCell>
                  <TableCell>
                    <Chip label={combo.comboTypeName || combo.comboType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{combo.seasonName || '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatCurrency(combo.comboPrice, 'vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={combo.totalItems ?? combo.comboItems?.length ?? 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={combo.isActive ? 'Active' : 'Inactive'}
                      color={combo.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" color="info" onClick={() => onView(combo)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa combo">
                        <IconButton size="small" color="primary" onClick={() => onEdit(combo)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={combo.isActive ? 'Deactivate combo' : 'Activate combo'}>
                        <IconButton
                          size="small"
                          color={combo.isActive ? 'success' : 'default'}
                          onClick={() => onToggleActive(combo)}
                        >
                          {combo.isActive ? (
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

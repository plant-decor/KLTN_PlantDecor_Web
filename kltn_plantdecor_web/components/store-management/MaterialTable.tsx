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
import type { Material } from '@/types/store-management.types';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface MaterialTableProps {
  materials: Material[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onEdit: (material: Material) => void;
  onToggleActive: (material: Material) => void;
  onView: (material: Material) => void;
}

export default function MaterialTable({
  materials,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onToggleActive,
  onView,
}: MaterialTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search is currently disabled for Material tab. List is loaded by server pagination.
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Material Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Base Price
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Expiry
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No data</Typography>
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
                <TableRow key={material.id} hover>
                  <TableCell>{material.id}</TableCell>
                  <TableCell>
                    <Image
                      src={material.primaryImageUrl || '/img/fallbackplant.avif'}
                      alt={material.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{material.materialCode}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.brand || '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatCurrency(material.basePrice, 'vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={material.unit || '-'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    {material.expiryMonths != null ? `${material.expiryMonths} months` : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={material.isActive ? 'Active' : 'Inactive'}
                      color={material.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View details">
                        <IconButton size="small" color="info" onClick={() => onView(material)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit material">
                        <IconButton size="small" color="primary" onClick={() => onEdit(material)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={material.isActive ? 'Deactivate material' : 'Activate material'}>
                        <IconButton
                          size="small"
                          color={material.isActive ? 'success' : 'default'}
                          onClick={() => onToggleActive(material)}
                        >
                          {material.isActive ? (
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

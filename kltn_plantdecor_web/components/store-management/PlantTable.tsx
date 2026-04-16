'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  TextField,
  Box,
  Chip,
  Typography,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Visibility,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import type { Plant } from '@/types/store-management.types';
import { formatCurrency } from '@/lib/utils/formatUtil';
import Image from 'next/image';

interface PlantTableProps {
  plants: Plant[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  keyword: string;
  onSearchChange: (keyword: string) => void;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onEdit: (plant: Plant) => void;
  onToggleActive: (plant: Plant) => void;
  onView: (plant: Plant) => void;
}

function PlantTable({
  plants,
  pageNumber,
  pageSize,
  totalCount,
  keyword,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onToggleActive,
  onView,
}: PlantTableProps) {
  const [searchTerm, setSearchTerm] = useState(keyword);

  useEffect(() => {
    setSearchTerm(keyword);
  }, [keyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== keyword) {
        onSearchChange(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, keyword, onSearchChange]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TextField
        placeholder="Search plant by name..."
        fullWidth
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Plant Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Care Level</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Base Price
              </TableCell>
              {/* <TableCell sx={{ fontWeight: 600 }} align="center">
                Available Stock
              </TableCell> */}
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plants.length === 0 ? 
            // (
            //   <TableRow>
            //     <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            //       <CircularProgress size={24} />
            //     </TableCell>
            //   </TableRow>
            // ) : plants.length === 0 ? (
            (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No data</Typography>
                </TableCell>
              </TableRow>
            ) : (
              plants.map((plant) => (
                <TableRow key={plant.id} hover>
                  <TableCell>{plant.id}</TableCell>
                  <TableCell>
                    <Image
                      src={plant.primaryImageUrl || '/img/fallbackplant.avif'}
                      alt={plant.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>{plant.name}</TableCell>
                  <TableCell>{plant.sizeName}</TableCell>
                  <TableCell>
                    <Chip label={plant.careLevelTypeName || plant.careLevel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {formatCurrency(plant.basePrice, 'vi-VN')}
                    </Typography>
                  </TableCell>
                  {/* <TableCell align="center">{plant.totalAvailableStock}</TableCell> */}
                  <TableCell>
                    <Chip
                      label={plant.isActive ? 'Active' : 'Inactive'}
                      color={plant.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View details">
                        <IconButton size="small" color="info" onClick={() => onView(plant)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit plant">
                        <IconButton size="small" color="primary" onClick={() => onEdit(plant)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={plant.isActive ? 'Deactivate plant' : 'Activate plant'}>
                        <IconButton size="small" color={plant.isActive ? 'success' : 'default'} onClick={() => onToggleActive(plant)}>
                          {plant.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
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

export default React.memo(PlantTable);

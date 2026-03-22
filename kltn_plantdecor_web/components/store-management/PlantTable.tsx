'use client';

import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import type { Plant } from '@/types/store-management.types';

interface PlantTableProps {
  plants: Plant[];
  onEdit: (plant: Plant) => void;
  onDelete: (plantId: number) => void;
  onView: (plant: Plant) => void;
}

export default function PlantTable({ plants, onEdit, onDelete, onView }: PlantTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.specificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.plantType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plants, searchTerm]);

  const paginatedPlants = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPlants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPlants, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <TextField
        placeholder="Tìm kiếm cây (tên, tên khoa học, loại)..."
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
              <TableCell sx={{ fontWeight: 600 }}>Tên cây</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên khoa học</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại cây</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Giá
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mức độ chăm sóc</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPlants.map((plant) => (
                <TableRow key={plant.plantId} hover>
                  <TableCell>{plant.name}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {plant.specificName}
                  </TableCell>
                  <TableCell>{plant.plantType}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {plant.basePrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={plant.careLevel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plant.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                      color={plant.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(plant)}
                        title="Xem chi tiết"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(plant)}
                        title="Chỉnh sửa"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(plant.plantId)}
                        title="Xóa"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPlants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </TableContainer>
    </Box>
  );
}

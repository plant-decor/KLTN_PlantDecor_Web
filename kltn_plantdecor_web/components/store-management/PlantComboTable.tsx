'use client';

import React, { useMemo, useState } from 'react';
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
import type { PlantCombo } from '@/types/store-management.types';

interface PlantComboTableProps {
  combos: PlantCombo[];
  onEdit: (combo: PlantCombo) => void;
  onDelete: (comboId: number) => void;
  onView: (combo: PlantCombo) => void;
}

export default function PlantComboTable({ combos, onEdit, onDelete, onView }: PlantComboTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredCombos = useMemo(() => {
    return combos.filter((combo) =>
      combo.comboName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.comboCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.comboType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combos, searchTerm]);

  const paginatedCombos = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredCombos.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCombos, page, rowsPerPage]);

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
        placeholder="Tìm kiếm combo (tên, mã, loại)..."
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
              <TableCell sx={{ fontWeight: 600 }}>Mã combo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên combo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Giá combo
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Giảm giá
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCombos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCombos.map((combo) => (
                <TableRow key={combo.plantComboId} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{combo.comboCode}</TableCell>
                  <TableCell>{combo.comboName}</TableCell>
                  <TableCell>
                    <Chip label={combo.comboType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {combo.comboPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`-${combo.discountPercent}%`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={combo.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                      color={combo.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(combo)}
                        title="Xem chi tiết"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(combo)}
                        title="Chỉnh sửa"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(combo.plantComboId)}
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
          count={filteredCombos.length}
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

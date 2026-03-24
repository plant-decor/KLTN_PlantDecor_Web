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
import type { Material } from '@/types/store-management.types';

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: number) => void;
  onView: (material: Material) => void;
}

export default function MaterialTable({ materials, onEdit, onDelete, onView }: MaterialTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  const paginatedMaterials = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredMaterials.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredMaterials, page, rowsPerPage]);

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
        placeholder="Tìm kiếm vật tư (tên, mã, thương hiệu)..."
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
              <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên vật tư</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Thương hiệu</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Giá
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Đơn vị</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Hạn (tháng)
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMaterials.map((material) => (
                <TableRow key={material.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{material.materialCode}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.brand}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {material.basePrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={material.unit} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{material.expiryMonths}</TableCell>
                  <TableCell>
                    <Chip
                      label={material.isActive ? 'Kích hoạt' : 'Vô hiệu'}
                      color={material.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(material)}
                        title="Xem chi tiết"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(material)}
                        title="Chỉnh sửa"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(material.id)}
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
          count={filteredMaterials.length}
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

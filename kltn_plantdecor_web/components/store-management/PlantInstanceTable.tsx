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
import type { PlantInstance } from '@/types/store-management.types';

interface PlantInstanceTableProps {
  instances: PlantInstance[];
  onEdit: (instance: PlantInstance) => void;
  onDelete: (id: number) => void;
  onView: (instance: PlantInstance) => void;
}

const getStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'Có sẵn',
    2: 'Đã bán',
    3: 'Hư hỏng',
    4: 'Không bán',
  };
  return statusMap[status] || 'Không xác định';
};

export default function PlantInstanceTable({
  instances,
  onEdit,
  onDelete,
  onView,
}: PlantInstanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredInstances = useMemo(() => {
    return instances.filter(
      (instance) =>
        instance.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.plantId.toString().includes(searchTerm.toLowerCase())
    );
  }, [instances, searchTerm]);

  const paginatedInstances = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredInstances.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredInstances, page, rowsPerPage]);

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
        placeholder="Tìm kiếm (SKU, ID Cây)..."
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
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                ID Cây
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Chiều cao
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Giá
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sức khỏe</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInstances.map((instance) => (
                <TableRow key={instance.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{instance.sku}</TableCell>
                  <TableCell align="center">{instance.plantId}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{instance.height} cm</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="600">
                      {instance.specificPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={instance.healthStatus} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(instance.status)}
                      color={instance.status === 1 ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(instance)}
                        title="Xem chi tiết"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(instance)}
                        title="Chỉnh sửa"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(instance.id)}
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
          count={filteredInstances.length}
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

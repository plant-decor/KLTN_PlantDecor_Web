'use client';

import {
  Box,
  Button,
  Chip,
  Paper,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { ManagerNurseryOrder } from '@/types/manager-sales-orders.types';
import {
  formatCurrency,
  SALES_ORDER_STATUS_CHIP_COLOR,
  SALES_ORDER_STATUS_LABELS,
} from './managerSalesOrders.constants';

interface ManagerSalesOrdersTableProps {
  items: ManagerNurseryOrder[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onViewDetail: (item: ManagerNurseryOrder) => void;
}

export default function ManagerSalesOrdersTable({
  items,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onViewDetail,
}: ManagerSalesOrdersTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(Number.parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Mã đơn vườn</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mã đơn tổng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Shipper</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Tạm tính
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Sản phẩm
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Không có đơn hàng phù hợp bộ lọc hiện tại.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const mappedStatus = item.status as keyof typeof SALES_ORDER_STATUS_LABELS;
                const customerDescription = `${item.customerName} - ${item.customerPhone}`;
                const shipperDescription = item.shipperName || 'Chưa phân công';

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>#{item.orderId}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.customerName}
                      </Typography>
                      <Tooltip title={customerDescription}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                          {item.customerEmail}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{shipperDescription}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.shipperPhone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.subTotalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={SALES_ORDER_STATUS_CHIP_COLOR[mappedStatus] || 'default'}
                        label={SALES_ORDER_STATUS_LABELS[mappedStatus] || item.statusName || `#${item.status}`}
                      />
                    </TableCell>
                    <TableCell align="center">{item.items.length}</TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="small" onClick={() => onViewDetail(item)}>
                        <VisibilityIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
          labelRowsPerPage="Số dòng"
        />
      </TableContainer>
    </Box>
  );
}

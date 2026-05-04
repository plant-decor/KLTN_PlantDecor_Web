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
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { ManagerReturnTicketAssignmentListItem } from '@/types/return-ticket.types';
import {
  RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR,
  RETURN_TICKET_STATUS_CHIP_COLOR,
  formatCurrency,
  formatDateTime,
} from './managerReturnTicket.constants';

interface ManagerReturnTicketAssignmentsTableProps {
  items: ManagerReturnTicketAssignmentListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onViewDetail: (item: ManagerReturnTicketAssignmentListItem) => void;
}

export default function ManagerReturnTicketAssignmentsTable({
  items,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onViewDetail,
}: ManagerReturnTicketAssignmentsTableProps) {
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
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nursery</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Assignment Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Ticket Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Refunded Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Assigned At
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No return ticket assignments found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.assignmentId} hover>
                  <TableCell>#{item.assignmentId}</TableCell>
                  <TableCell>#{item.returnTicketId}</TableCell>
                  <TableCell>#{item.orderId}</TableCell>
                  <TableCell>{item.nurseryName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customer #{item.customerId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={item.assignmentStatusName}
                      color={RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR[item.assignmentStatus] || 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={item.ticketStatusName}
                      color={RETURN_TICKET_STATUS_CHIP_COLOR[item.ticketStatus] || 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(item.ticketTotalRefundedAmount)}</TableCell>
                  <TableCell align="center">{formatDateTime(item.assignedAt)}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => onViewDetail(item)}>
                      <VisibilityIcon fontSize="small" />
                    </Button>
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
          labelRowsPerPage="Rows"
        />
      </TableContainer>
    </Box>
  );
}

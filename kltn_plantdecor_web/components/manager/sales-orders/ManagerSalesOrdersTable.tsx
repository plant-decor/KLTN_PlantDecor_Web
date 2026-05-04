'use client';

import { useMemo, useState } from 'react';
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ImageIcon from '@mui/icons-material/Image';
import ReplayIcon from '@mui/icons-material/Replay';
import type { ManagerNurseryOrder } from '@/types/manager-sales-orders.types';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';
import RedeliveryConfirmationModal from './RedeliveryConfirmationModal';
import {
  formatCurrency,
  SALES_ORDER_STATUS_CHIP_COLOR,
  SALES_ORDER_STATUS_LABELS,
} from './managerSalesOrders.constants';

const ASSIGNABLE_STATUSES = new Set([1, 2, 3]);

// const getPaidAmount = (order: ManagerNurseryOrder): number | undefined => {
//   const candidate = order.paymentAmount ?? order.paidAmount ?? order.amountPaid;
//   return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : undefined;
// };

interface ManagerSalesOrdersTableProps {
  items: ManagerNurseryOrder[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onViewDetail: (item: ManagerNurseryOrder) => void;
  onAssignShipper?: (item: ManagerNurseryOrder) => void;
  onRedelivery?: (item: ManagerNurseryOrder) => void;
}

export default function ManagerSalesOrdersTable({
  items,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onViewDetail,
  onAssignShipper,
  onRedelivery,
}: ManagerSalesOrdersTableProps) {
  const [shipImageOpen, setShipImageOpen] = useState(false);
  const [shipImageUrl, setShipImageUrl] = useState<string | null>(null);
  const shipImages = useMemo(() => (shipImageUrl ? [shipImageUrl] : []), [shipImageUrl]);

  const [redeliveryTarget, setRedeliveryTarget] = useState<ManagerNurseryOrder | null>(null);

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
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Shipper</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Deposit
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Remaining
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Subtotal
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Items
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No orders match the current filter.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const mappedStatus = item.status as keyof typeof SALES_ORDER_STATUS_LABELS;
                const customerDescription = `${item.customerName} - ${item.customerPhone}`;
                const shipperDescription = item.shipperName || 'Unassigned';
                const canAssignShipper = ASSIGNABLE_STATUSES.has(item.status);
                const canRedeliver = item.status === 9 || item.statusName === 'Failed';
                // const paidAmount = getPaidAmount(item);

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
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
                    {/* <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {paidAmount != null ? formatCurrency(paidAmount) : '-'}
                      </Typography>
                    </TableCell> */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.depositAmount ?? undefined)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(item.remainingAmount ?? 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
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
                      {onAssignShipper ? (
                        <Tooltip title={canAssignShipper ? 'Assign shipper' : 'Only for DepositPaid / Paid / Assigned'}>
                          <span>
                            <Button size="small" disabled={!canAssignShipper} onClick={() => onAssignShipper(item)}>
                              <AssignmentIndIcon fontSize="medium" className="hover:scale-110" />
                            </Button>
                          </span>
                        </Tooltip>
                      ) : null}
                      {onRedelivery && canRedeliver ? (
                        <Tooltip title="Redelivery">
                          <Button size="small" onClick={() => setRedeliveryTarget(item)}>
                            <ReplayIcon fontSize="medium" className="hover:scale-110" />
                          </Button>
                        </Tooltip>
                      ) : null}
                      {item.deliveryImageUrl ? (
                        <Tooltip title="View ship image">
                          <Button
                            size="small"
                            onClick={() => {
                              setShipImageUrl(item.deliveryImageUrl ?? null);
                              setShipImageOpen(true);
                            }}
                          >
                            <ImageIcon fontSize="medium" className="hover:scale-110" />
                          </Button>
                        </Tooltip>
                      ) : null}
                      <Button size="small" onClick={() => onViewDetail(item)}>
                        <VisibilityIcon fontSize="medium" className="hover:scale-110" />
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
          labelRowsPerPage="Rows"
        />
      </TableContainer>

      <FullscreenImageModal
        images={shipImages}
        initialIndex={0}
        isOpen={shipImageOpen}
        onClose={() => {
          setShipImageOpen(false);
          setShipImageUrl(null);
        }}
        alt="Delivery image"
      />

      <RedeliveryConfirmationModal
        open={!!redeliveryTarget}
        onClose={() => setRedeliveryTarget(null)}
        onConfirm={() => {
          if (redeliveryTarget && onRedelivery) {
            onRedelivery(redeliveryTarget);
          }
          setRedeliveryTarget(null);
        }}
      />
    </Box>
  );
}

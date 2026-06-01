'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  TablePagination,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useLocale } from 'next-intl';
import type { OrderInvoiceDetail, OrderItem } from '@/types/order.types';
import {
  INITIAL_CONSULTANT_ORDER_FILTER_APPLIED,
  INITIAL_CONSULTANT_ORDER_FILTER_DRAFT,
  type ConsultantOrder,
} from '@/types/consultant-order.types';
import { getConsultantOrderById, searchConsultantOrders } from '@/lib/api/consultantOrdersService';
import { getSystemEnumByName } from '@/lib/api/systemEnumsService';
import { formatCurrency } from '@/lib/utils/formatUtil';
import {
  consultantFilterDraftToApplied,
  localDateOnlyEndToIso,
  localDateOnlyStartToIso,
} from '@/lib/utils/consultantOrderFilters';
import { CustomLoading } from '@/components/CustomLoading';
import ConsultantCustomerOrdersFilter from '@/components/consultant/ConsultantCustomerOrdersFilter';
import ManagementHeader from '@/components/layout/ManagementHeader';
import { formatDateTime } from '@/lib/utils/dateUtils';

/** Đổi tên nếu Swagger backend khác */
const ORDER_STATUSES_ENUM = 'OrderStatuses';
const ORDER_TYPES_ENUM = 'OrderTypes';
const PAYMENT_STRATEGIES_ENUM = 'PaymentStrategies';

/** Giá trị sortBy — xác nhận với API nếu backend chỉ hỗ trợ một subset */
const SORT_BY_OPTIONS = ['CreatedAt', 'TotalAmount', 'UpdatedAt'] as const;
type SortByOption = (typeof SORT_BY_OPTIONS)[number];

type LineRow = {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

const normalizeError = (err: unknown, fallback: string): string => {
  if (!err || typeof err !== 'object') {
    return fallback;
  }
  const candidate = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return candidate.response?.data?.message || candidate.message || fallback;
};

function getStatusColor(
  statusName: string
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (statusName) {
    case 'Completed':
    case 'Delivered':
    case 'Paid':
    case 'DepositPaid':
      return 'success';
    case 'Pending':
    case 'RemainingPaymentPending':
    case 'PendingConfirmation':
      return 'warning';
    case 'Shipping':
    case 'Assigned':
      return 'info';
    case 'Cancelled':
    case 'Failed':
    case 'Rejected':
    case 'Refunded':
      return 'error';
    case 'RefundRequested':
      return 'warning';
    default:
      return 'default';
  }
}

function buildLineRows(order: ConsultantOrder): LineRow[] {
  if (order.items?.length) {
    return order.items.map((item: OrderItem) => ({
      key: `item-${item.id}`,
      name: item.itemName,
      quantity: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
    }));
  }

  const rows: LineRow[] = [];
  for (const inv of order.invoices ?? []) {
    for (const d of inv.details ?? []) {
      const detail = d as OrderInvoiceDetail;
      rows.push({
        key: `inv-${inv.id}-d-${detail.id}`,
        name: detail.itemName,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        amount: detail.amount,
      });
    }
  }
  return rows;
}


export default function CustomerOrdersPage() {
  const locale = useLocale();
  const [filterDraft, setFilterDraft] = useState(() => ({
    ...INITIAL_CONSULTANT_ORDER_FILTER_DRAFT,
  }));
  const [filterApplied, setFilterApplied] = useState(() => ({
    ...INITIAL_CONSULTANT_ORDER_FILTER_APPLIED,
  }));

  const [items, setItems] = useState<ConsultantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [detailOrder, setDetailOrder] = useState<ConsultantOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [orderStatusByValue, setOrderStatusByValue] = useState<Record<number, string>>({});
  const [orderTypeByValue, setOrderTypeByValue] = useState<Record<number, string>>({});
  const [paymentStrategyByValue, setPaymentStrategyByValue] = useState<Record<number, string>>({});

  const [sortBy, setSortBy] = useState<SortByOption>('CreatedAt');
  const [sortDirection, setSortDirection] = useState<'Asc' | 'Desc'>('Asc');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const results = await Promise.allSettled([
        getSystemEnumByName(ORDER_STATUSES_ENUM, false),
        getSystemEnumByName(ORDER_TYPES_ENUM, false),
        getSystemEnumByName(PAYMENT_STRATEGIES_ENUM, false),
      ]);
      if (cancelled) {
        return;
      }
      const toMap = (idx: number) => {
        const r = results[idx];
        const map: Record<number, string> = {};
        if (r.status === 'fulfilled') {
          for (const v of r.value) {
            map[v.value] = v.name;
          }
        }
        return map;
      };
      setOrderStatusByValue(toMap(0));
      setOrderTypeByValue(toMap(1));
      setPaymentStrategyByValue(toMap(2));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paymentStrategyLabel = useCallback(
    (value: number) => paymentStrategyByValue[value] ?? String(value),
    [paymentStrategyByValue]
  );

  useEffect(() => {
    setPage(0);
  }, [filterApplied, sortBy, sortDirection]);

  const handleApplyFilters = useCallback(() => {
    setFilterApplied(consultantFilterDraftToApplied(filterDraft));
  }, [filterDraft]);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pageNumber = page + 1;
      const createdFromIso = localDateOnlyStartToIso(filterApplied.createdFrom);
      const createdToIso = localDateOnlyEndToIso(filterApplied.createdTo);

      const payload = await searchConsultantOrders(
        {
          pagination: { pageNumber, pageSize },
          customerEmail: filterApplied.email || undefined,
          status: filterApplied.status,
          orderType: filterApplied.orderType,
          paymentStrategy: filterApplied.payment,
          createdFrom: createdFromIso,
          createdTo: createdToIso,
          minTotalAmount: filterApplied.minTotal,
          maxTotalAmount: filterApplied.maxTotal,
          sortBy,
          sortDirection,
        },
        true
      );

      if (!payload) {
        setItems([]);
        setTotalCount(0);
        return;
      }

      setItems(payload.items ?? []);
      setTotalCount(payload.totalCount ?? 0);
    } catch (err) {
      const message = normalizeError(err, 'Failed to load orders');
      setError(message);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterApplied, sortBy, sortDirection]);

  const handleResetFilters = useCallback(() => {
    setFilterDraft({ ...INITIAL_CONSULTANT_ORDER_FILTER_DRAFT });
    setFilterApplied({ ...INITIAL_CONSULTANT_ORDER_FILTER_APPLIED });
    setSortBy('CreatedAt');
    setSortDirection('Asc');
    setPage(0);
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const handleViewDetail = useCallback(async (orderId: number) => {
    setDetailOrderId(orderId);
    setDetailOrder(null);
    setDetailError(null);
    setOpenDetail(true);
    setDetailLoading(true);
    try {
      const data = await getConsultantOrderById(orderId, true);
      if (!data) {
        setDetailError('Order not found');
        return;
      }
      setDetailOrder(data);
    } catch (err) {
      setDetailError(normalizeError(err, 'Failed to load order detail'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailOrderId(null);
    setDetailOrder(null);
    setDetailError(null);
  };

  const lineRows = detailOrder ? buildLineRows(detailOrder) : [];

  return (
    <Box sx={{ py: 4 }}>
      <ManagementHeader
        title="Customer Orders"
        description="View customer order information to assist with inquiries"
        entityLabel="customer order"
        count={totalCount}
      />

      <Box sx={{ mb: 2 }}>
        <ConsultantCustomerOrdersFilter
          value={filterDraft}
          onChange={setFilterDraft}
          orderStatusByValue={orderStatusByValue}
          orderTypeByValue={orderTypeByValue}
          paymentStrategyByValue={paymentStrategyByValue}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="consultant-order-sort-by">Sort by</InputLabel>
          <Select
            labelId="consultant-order-sort-by"
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByOption)}
          >
            {SORT_BY_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          size="small"
          color="primary"
          onClick={() => setSortDirection((d) => (d === 'Asc' ? 'Desc' : 'Asc'))}
          aria-label={sortDirection === 'Asc' ? 'Ascending, click for descending' : 'Descending, click for ascending'}
          title={sortDirection === 'Asc' ? 'Ascending' : 'Descending'}
        >
          {sortDirection === 'Asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CustomLoading size={18} />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }} color="text.secondary">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{order.id}</TableCell>
                  <TableCell>{order.customerName ?? '—'}</TableCell>
                  <TableCell>{order.customerEmail ?? '—'}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(order.totalAmount, locale)}
                  </TableCell>
                  <TableCell>{paymentStrategyLabel(order.paymentStrategy)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.statusName}
                      color={getStatusColor(order.statusName)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt ?? '')}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      className="bg-transparent! rounded-full!"
                      onClick={() => void handleViewDetail(order.id)}
                    >
                      <VisibilityIcon fontSize="medium" className="hover:scale-110" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={Math.max(0, totalCount)}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            const next = Number(event.target.value);
            setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </TableContainer>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon fontSize="small" />
          Order Details{detailOrderId != null ? ` #${detailOrderId}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CustomLoading size={18} />
            </Box>
          )}
          {!detailLoading && detailError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          )}
          {!detailLoading && detailOrder && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {detailOrder.customerName ?? '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {detailOrder.customerEmail ?? '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {detailOrder.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {detailOrder.address}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment strategy:</strong> {paymentStrategyLabel(detailOrder.paymentStrategy)}
                </Typography>
                {detailOrder.note ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Note:</strong> {detailOrder.note}
                  </Typography>
                ) : null}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Line items
                </Typography>
                {lineRows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No line items
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Item</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Unit price</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lineRows.map((row) => (
                          <TableRow key={row.key}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align="center">{row.quantity}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(row.unitPrice, locale)}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(row.amount, locale)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              {detailOrder.invoices?.length ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Invoices
                    </Typography>
                    {detailOrder.invoices.map((inv) => (
                      <Box
                        key={inv.id}
                        sx={{
                          mb: 2,
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>#{inv.id}</strong> — {inv.typeName} · {inv.statusName} ·{' '}
                          {formatCurrency(inv.totalAmount, locale)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Issued {formatDateTime(inv.issuedDate ?? '')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : null}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Created:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatDateTime(detailOrder.createdAt ?? '')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Updated:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatDateTime(detailOrder.updatedAt ?? '')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Status:</Typography>
                  <Chip
                    label={detailOrder.statusName}
                    color={getStatusColor(detailOrder.statusName)}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {formatCurrency(detailOrder.totalAmount, locale)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

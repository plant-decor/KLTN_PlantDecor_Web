'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { ManagerReturnTicketAssignmentDetail, ManagerReturnTicketAssignmentItem } from '@/types/return-ticket.types';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';
import {
  RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR,
  RETURN_TICKET_ITEM_STATUS_CHIP_COLOR,
  RETURN_TICKET_STATUS_CHIP_COLOR,
  formatCurrency,
  formatDateTime,
} from './managerReturnTicket.constants';
import { ImageOutlined } from '@mui/icons-material';

interface ManagerReturnTicketAssignmentDetailDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  detail: ManagerReturnTicketAssignmentDetail | null;
  approveQuantityByItemId: Record<number, number>;
  noteByItemId: Record<number, string>;
  onClose: () => void;
  onStartReview: (assignmentId: number) => Promise<void>;
  onApproveItem: (assignmentId: number, item: ManagerReturnTicketAssignmentItem) => Promise<void>;
  onRejectItem: (assignmentId: number, item: ManagerReturnTicketAssignmentItem) => Promise<void>;
  onRefundItem: (assignmentId: number, item: ManagerReturnTicketAssignmentItem) => Promise<void>;
  onChangeApproveQuantity: (itemId: number, quantity: number) => void;
  onChangeItemNote: (itemId: number, note: string) => void;
}

export default function ManagerReturnTicketAssignmentDetailDialog({
  open,
  loading,
  submitting,
  detail,
  approveQuantityByItemId,
  noteByItemId,
  onClose,
  onStartReview,
  onApproveItem,
  onRejectItem,
  onRefundItem,
  onChangeApproveQuantity,
  onChangeItemNote,
}: ManagerReturnTicketAssignmentDetailDialogProps) {
  const canStartReview = !!detail && detail.assignmentStatus === 0;
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImages, setActiveImages] = useState<string[]>([]);

  const handleOpenEvidenceImages = (imageUrls: string[]) => {
    if (imageUrls.length === 0) {
      return;
    }

    setActiveImages(imageUrls);
    setImageModalOpen(true);
  };

  const handleCloseEvidenceImages = () => {
    setImageModalOpen(false);
    setActiveImages([]);
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {detail
          ? `Return Ticket Assignment #${detail.assignmentId} (Ticket #${detail.returnTicketId})`
          : 'Return Ticket Assignment Detail'}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : !detail ? (
          <Typography color="text.secondary">No detail data available.</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Order ID:</strong> #{detail.orderId}
                </Typography>
                <Typography variant="body2">
                  <strong>Nursery:</strong> {detail.nurseryName}
                </Typography>
                <Typography variant="body2">
                  <strong>Customer:</strong> {detail.customerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Assigned At:</strong> {formatDateTime(detail.assignedAt)}
                </Typography>
              </Stack>

              <Stack spacing={1} alignItems={{ md: 'flex-end' }}>
                <Chip
                  size="small"
                  label={`Assignment: ${detail.assignmentStatusName}`}
                  color={RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR[detail.assignmentStatus] || 'default'}
                />
                <Chip
                  size="small"
                  label={`Ticket: ${detail.ticketStatusName}`}
                  color={RETURN_TICKET_STATUS_CHIP_COLOR[detail.ticketStatus] || 'default'}
                />
                <Typography variant="body2" fontWeight={600}>
                  Refunded Total: {formatCurrency(detail.ticketTotalRefundedAmount)}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="body2">
              <strong>Ticket Reason:</strong> {detail.ticketReason || '-'}
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Requested
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Approved Qty
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Manager Note</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Evidence
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.items.map((item) => {
                  const canReviewItem = detail.assignmentStatus === 1 && item.status === 0;
                  const canRefundItem = item.status === 1;
                  const approvedQty = approveQuantityByItemId[item.id] ?? item.requestedQuantity;
                  const note = noteByItemId[item.id] ?? '';

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Detail #{item.nurseryOrderDetailId}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.requestedQuantity}</TableCell>
                      <TableCell align="center" sx={{ width: 120 }}>
                        <TextField
                          type="number"
                          size="small"
                          value={approvedQty}
                          inputProps={{ min: 0, max: item.requestedQuantity }}
                          disabled={!canReviewItem || submitting}
                          onChange={(event) =>
                            onChangeApproveQuantity(item.id, Number.parseInt(event.target.value || '0', 10))
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter review note"
                          disabled={!canReviewItem || submitting}
                          value={note}
                          onChange={(event) => onChangeItemNote(item.id, event.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={item.statusName}
                          color={RETURN_TICKET_ITEM_STATUS_CHIP_COLOR[item.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {item.imageUrls.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            No images
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenEvidenceImages(item.imageUrls)}
                          >
                            Evidence <ImageOutlined sx={{ ml: 0.5 }} />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {canReviewItem ? (
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              variant="contained"
                              size="small"
                              disabled={submitting}
                              onClick={() => void onApproveItem(detail.assignmentId, item)}
                              className='bg-primary!'
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={submitting}
                              onClick={() => void onRejectItem(detail.assignmentId, item)}
                            >
                              Reject
                            </Button>
                          </Stack>
                        ) : canRefundItem ? (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={submitting}
                            onClick={() => void onRefundItem(detail.assignmentId, item)}
                            className='bg-primary!'
                          >
                            Refund
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not actionable
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        )}
      </DialogContent>
        {activeImages.length > 0 && (
      <FullscreenImageModal
        images={activeImages}
        isOpen={imageModalOpen}
        onClose={handleCloseEvidenceImages}
        alt="Return evidence image"
      />
        )}
      <DialogActions>
        {canStartReview ? (
          <Button
            variant="contained"
            onClick={() => detail && void onStartReview(detail.assignmentId)}
            disabled={submitting || !detail}
            className='bg-primary!'
          >
            Start Review
          </Button>
        ) : null}
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

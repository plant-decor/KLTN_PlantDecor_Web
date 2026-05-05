'use client';

import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { CustomerDesignRegistrationDetail, DesignRegistrationTask } from '@/types/design-registration.types';
import { canApproveDesign, canManagerCancelDesign, canRejectDesign, getDesignStatusChipColor } from '../utils/designStatusUtil';
import { formatDateTime } from '@/lib/utils/dateUtils';

interface DesignOrderDetailDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  detailItem: CustomerDesignRegistrationDetail | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (item: CustomerDesignRegistrationDetail) => void;
  onCancel: (item: CustomerDesignRegistrationDetail) => void;
  onAssignTask: (task: DesignRegistrationTask, registration: CustomerDesignRegistrationDetail) => void;
  onRescheduleTask: (task: DesignRegistrationTask, registration: CustomerDesignRegistrationDetail) => void;
  getDesignRegistrationStatusLabel: (item: Pick<CustomerDesignRegistrationDetail, 'status' | 'statusName'>) => string;
  getDesignTaskStatusLabel: (task: DesignRegistrationTask) => string;
  getDesignTaskTypeLabel: (task: DesignRegistrationTask) => string;
}

export default function DesignOrderDetailDialog({
  open,
  loading,
  submitting,
  detailItem,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onAssignTask,
  onRescheduleTask,
  getDesignRegistrationStatusLabel,
  getDesignTaskStatusLabel,
  getDesignTaskTypeLabel,
}: DesignOrderDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{detailItem ? `Design Registration #${detailItem.id}` : 'Design Registration'}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading design registration details...</Typography>
          </Box>
        ) : detailItem ? (
          <Stack spacing={1.5}>
            <Box>
              <strong>Status:</strong>{' '}
              <Chip
                size="small"
                color={getDesignStatusChipColor(detailItem.status)}
                label={getDesignRegistrationStatusLabel(detailItem)}
              />
            </Box>
            {detailItem.customer && (
              <Typography variant="body2">
                <strong>Customer:</strong> {detailItem.customer.fullName} ({detailItem.customer.email || '-'})
              </Typography>
            )}
            <Typography variant="body2"><strong>Phone:</strong> {detailItem.phone || '-'}</Typography>
            <Typography variant="body2"><strong>Address:</strong> {detailItem.address || '-'}</Typography>
            <Typography variant="body2"><strong>Nursery:</strong> {detailItem.nursery?.name || 'Optional'}</Typography>
            <Typography variant="body2"><strong>Template:</strong> {detailItem.designTemplateTier.designTemplate.name || '-'}</Typography>
            <Typography variant="body2"><strong>Tier:</strong> {detailItem.designTemplateTier.tierName || '-'}</Typography>
            <Typography variant="body2"><strong>Total price:</strong> {detailItem.totalPrice?.toLocaleString('vi-VN') || '-'}</Typography>
            <Typography variant="body2"><strong>Deposit:</strong> {detailItem.depositAmount?.toLocaleString('vi-VN') || '-'}</Typography>
            <Typography variant="body2"><strong>Order ID:</strong> {detailItem.orderId ? `#${detailItem.orderId}` : '-'}</Typography>
            <Typography variant="body2"><strong>Assigned caretaker:</strong> {detailItem.assignedCaretaker?.fullName || '-'}</Typography>
            <Typography variant="body2"><strong>Customer note:</strong> {detailItem.customerNote || '-'}</Typography>
            <Typography variant="body2"><strong>Created at:</strong> {detailItem.createdAt ? formatDateTime(detailItem.createdAt) : '-'}</Typography>
            <Typography variant="body2"><strong>Approved at:</strong> {detailItem.approvedAt ? formatDateTime(detailItem.approvedAt) : '-'}</Typography>
            {detailItem.cancelReason && (
              <Typography variant="body2" color="error">
                <strong>Cancel Reason:</strong> {detailItem.cancelReason}
              </Typography>
            )}

            <Divider sx={{ my: 1 }} />

            <Typography variant="h6" fontWeight={700}>
              Design Tasks
            </Typography>
            {detailItem.designTasks.length === 0 ? (
              <Alert severity="info">No design tasks found for this registration.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scheduled Date</TableCell>
                      <TableCell>Assigned Staff</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailItem.designTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{getDesignTaskTypeLabel(task)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={getDesignTaskStatusLabel(task)} />
                        </TableCell>
                        <TableCell>{task.scheduledDate || '-'}</TableCell>
                        <TableCell>{task.assignedStaff?.fullName || '-'}</TableCell>
                        <TableCell align="center">
                          {task.status !== undefined && task.status !== null &&
                            task.status !== 3 &&
                            task.status !== 4 ? (
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onAssignTask(task, detailItem)}
                                disabled={submitting}
                              >
                                Assign
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onRescheduleTask(task, detailItem)}
                                disabled={submitting}
                              >
                                Reschedule
                              </Button>
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        ) : (
          <Typography>No detail data available.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {detailItem && canApproveDesign(detailItem.status) && (
            <Button
              variant="contained"
              color="success"
              className="bg-primary!"
              onClick={() => onApprove(detailItem.id)}
              disabled={submitting}
            >
              Approve
            </Button>
          )}
          {detailItem && canRejectDesign(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              className="bg-error!"
              onClick={() => onReject(detailItem)}
              disabled={submitting}
            >
              Reject
            </Button>
          )}
          {detailItem && canManagerCancelDesign(detailItem.status) && (
            <Button
              variant="outlined"
              color="error"
              className="bg-error!"
              onClick={() => onCancel(detailItem)}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </Box>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

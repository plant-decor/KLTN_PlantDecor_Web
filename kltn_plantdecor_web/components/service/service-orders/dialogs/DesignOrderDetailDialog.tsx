'use client';

import { useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import type { CustomerDesignRegistrationDetail, DesignRegistrationTask } from '@/types/design-registration.types';
import { canApproveDesign, canAssignDesignTask, canManagerCancelDesign, canRejectDesign, getDesignStatusChipColor } from '../utils/designStatusUtil';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { CalendarMonthOutlined, ImageOutlined, PersonAddOutlined, VisibilityOutlined } from '@mui/icons-material';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';

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
  onViewTaskDetail: (taskId: number) => void;
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
  onViewTaskDetail,
  getDesignRegistrationStatusLabel,
  getDesignTaskStatusLabel,
  getDesignTaskTypeLabel,
}: DesignOrderDetailDialogProps) {
  const [fullscreenReportImage, setFullscreenReportImage] = useState<string | null>(null);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
                      <TableRow sx={{ backgroundColor: 'var(--primary)' }} >
                        <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
                        <TableCell align='center' sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align='center' sx={{ fontWeight: 700 }}>Scheduled Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Assigned Staff</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailItem.designTasks.map((task) => {
                        const reportImageUrl = task.reportImageUrl?.trim();

                        return (
                          <TableRow key={task.id} hover>
                            <TableCell>{getDesignTaskTypeLabel(task)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={getDesignTaskStatusLabel(task)} />
                            </TableCell>
                            <TableCell>{task.scheduledDate || '-'}</TableCell>
                            <TableCell>{task.assignedStaff?.fullName || '-'}</TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
                                <Tooltip title="View detail">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => onViewTaskDetail(task.id)}
                                    className="bg-transparent! rounded-full!"
                                  >
                                    <VisibilityOutlined fontSize="medium" />
                                  </Button>
                                </Tooltip>

                                {canAssignDesignTask(task) && (
                                  <>
                                    <Tooltip title="Assign staff">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => onAssignTask(task, detailItem)}
                                        disabled={submitting}
                                        className="bg-blue-400! rounded-full!"
                                      >
                                        <PersonAddOutlined fontSize="medium" />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Reschedule">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => onRescheduleTask(task, detailItem)}
                                        disabled={submitting}
                                        className="bg-yellow-400! rounded-full!"
                                      >
                                        <CalendarMonthOutlined fontSize="medium" />
                                      </Button>
                                    </Tooltip>
                                  </>
                                )}

                                {reportImageUrl && (
                                  <Tooltip title="View report image">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => setFullscreenReportImage(reportImageUrl)}
                                      className="bg-green-500! rounded-full!"
                                    >
                                      <ImageOutlined fontSize="small" />
                                    </Button>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

      <FullscreenImageModal
        images={fullscreenReportImage ? [fullscreenReportImage] : []}
        isOpen={Boolean(fullscreenReportImage)}
        onClose={() => setFullscreenReportImage(null)}
        alt="Design task report"
      />
    </>
  );
}

'use client';

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Refresh } from '@mui/icons-material';
import type { AdminUser } from '@/types/admin-user.types';
import { formatRoleLabel, mapApiUserStatusToUi } from '@/lib/user-management/helpers';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { CustomLoading } from '../CustomLoading';
import useAdminUserAiQuota from '@/lib/api/admin/useAdminUserAiQuota';

interface UserDetailDialogProps {
  open: boolean;
  user: AdminUser | null;
  loading: boolean;
  saving: boolean;
  onClose: () => void;
  onToggleActive: () => void;
}

export default function UserDetailDialog({
  open,
  user,
  loading,
  saving,
  onClose,
  onToggleActive,
}: UserDetailDialogProps) {
  const uiStatus = user ? mapApiUserStatusToUi(user.status) : 'active';
  const [activeTab, setActiveTab] = useState(0);
  const [quotaTabLoaded, setQuotaTabLoaded] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const {
    quotaStatus,
    subscriptions,
    loading: quotaLoading,
    saving: quotaSaving,
    error: quotaError,
    fetchUserQuota,
    fetchUserSubscriptions,
    resetUserQuota,
  } = useAdminUserAiQuota();

  const loadQuotaData = useCallback(async () => {
    if (!user) return;
    await Promise.all([fetchUserQuota(user.id), fetchUserSubscriptions(user.id)]);
    setQuotaTabLoaded(true);
  }, [user, fetchUserQuota, fetchUserSubscriptions]);

  const handleClose = useCallback(() => {
    setActiveTab(0);
    setQuotaTabLoaded(false);
    onClose();
  }, [onClose]);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1 && !quotaTabLoaded && user) {
      loadQuotaData();
    }
  };

  const handleResetQuota = useCallback(async () => {
    if (!user) return;
    await resetUserQuota(user.id);
    setResetConfirmOpen(false);
  }, [user, resetUserQuota, setResetConfirmOpen]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          User details
          <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Info" />
        <Tab label="AI Quota" disabled={!user} />
      </Tabs>

      <DialogContent sx={{ pt: 2, minHeight: 300 }}>
        {activeTab === 0 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CustomLoading size={32} />
              </Box>
            ) : user ? (
              <Stack spacing={1.5}>
                <DetailRow label="ID" value={String(user.id)} />
                <DetailRow label="Username" value={user.username} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Phone" value={user.phoneNumber} />
                <DetailRow label="Role" value={formatRoleLabel(user.role)} />
                <DetailRow label="Status" value={formatRoleLabel(uiStatus)} />
                <DetailRow label="Verified" value={user.isVerified ? 'Yes' : 'No'} />
                {user.nurseryName != null && user.nurseryName !== '' && (
                  <DetailRow label="Nursery" value={user.nurseryName} />
                )}
                <Divider sx={{ my: 1 }} />
                <DetailRow label="Created at" value={formatDateTime(user.createdAt)} />
                <DetailRow label="Updated at" value={formatDateTime(user.updatedAt)} />
              </Stack>
            ) : (
              <Typography color="text.secondary">No data.</Typography>
            )}
          </>
        )}

        {activeTab === 1 && (
          <Box>
            {quotaLoading && !quotaTabLoaded ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CustomLoading size={32} />
              </Box>
            ) : (
              <Stack spacing={3}>
                {quotaError && (
                  <Alert severity="error">{quotaError}</Alert>
                )}

                {quotaStatus && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          AI Quota Status
                        </Typography>
                        <Tooltip title="Reset monthly quota for this user">
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => setResetConfirmOpen(true)}
                            disabled={quotaSaving}
                          >
                            Reset Monthly Quota
                          </Button>
                        </Tooltip>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', pt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Membership Tier</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={quotaStatus.tierName ?? `Cấp ${quotaStatus.tierLevel}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Remaining Quota</Typography>
                          <Typography variant="h6" fontWeight={700} color="primary">
                            {quotaStatus.totalRemainingQuota.toLocaleString()} requests
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Free Quota/Month</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {quotaStatus.tierMonthlyFreeQuota.toLocaleString()} requests
                          </Typography>
                        </Box>
                      </Box>

                      {quotaStatus.activeSubscriptions.length > 0 && (
                        <>
                          <Divider sx={{ mt: 1 }} />
                          <Typography variant="subtitle2" sx={{ mt: 1 }}>
                            Active Subscriptions
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700 }}>Package</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Used</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Expires</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {quotaStatus.activeSubscriptions.map((sub) => (
                                  <TableRow key={sub.subscriptionId}>
                                    <TableCell>
                                      <Stack spacing={0.5}>
                                        <Typography variant="body2" fontWeight={600}>{sub.packageName}</Typography>
                                        {sub.isMonthlyFree && (
                                          <Chip label="Monthly Free" size="small" color="success" sx={{ width: 'fit-content' }} />
                                        )}
                                      </Stack>
                                    </TableCell>
                                    <TableCell>{sub.totalQuota.toLocaleString('vi-VN')}</TableCell>
                                    <TableCell>{sub.usedQuota.toLocaleString('vi-VN')}</TableCell>
                                    <TableCell>
                                      <Stack spacing={0.5}>
                                        <Typography variant="body2">{sub.remainingQuota.toLocaleString('vi-VN')}</Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={sub.totalQuota > 0 ? (sub.usedQuota / sub.totalQuota) * 100 : 0}
                                          sx={{ height: 4, borderRadius: 2 }}
                                        />
                                      </Stack>
                                    </TableCell>
                                    <TableCell>
                                      {sub.endDate ? formatDateTime(sub.endDate) : 'Lifetime'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </>
                      )}
                    </Stack>
                  </Paper>
                )}

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Subscription History ({subscriptions.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Package</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Total / Used</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subscriptions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                              <Typography color="text.secondary" variant="body2">
                                No subscriptions found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscriptions.map((sub) => (
                            <TableRow key={sub.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>{sub.packageName}</Typography>
                                {sub.isMonthlyFree && (
                                  <Chip label="Free" size="small" color="success" sx={{ mt: 0.5 }} />
                                )}
                              </TableCell>
                              <TableCell>
                                {sub.usedQuota.toLocaleString('vi-VN')} / {sub.totalQuota.toLocaleString('vi-VN')}
                              </TableCell>
                              <TableCell>{sub.startDate ? formatDateTime(sub.startDate) : '—'}</TableCell>
                              <TableCell>{sub.endDate ? formatDateTime(sub.endDate) : 'Lifetime'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={sub.isActive ? 'Active' : 'Expired'}
                                  color={sub.isActive ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Close</Button>
        {activeTab === 0 && (
          <Button
            variant="contained"
            onClick={onToggleActive}
            disabled={!user || loading || saving}
            className="bg-primary!"
          >
            {saving ? 'Updating…' : uiStatus === 'active' ? 'Deactivate user' : 'Activate user'}
          </Button>
        )}
      </DialogActions>

      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)} maxWidth="xs">
        <DialogTitle>Confirm Quota Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Reset monthly AI quota for <strong>{user?.username}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)} disabled={quotaSaving}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetQuota} disabled={quotaSaving}>
            {quotaSaving ? 'Processing...' : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

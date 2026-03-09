'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration, ServiceRegistrationStatus } from '@/types/service.types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

const MOCK_CARETAKERS = [
  { id: 1, name: 'Nguyễn Văn A', rating: 4.8, totalServices: 45 },
  { id: 2, name: 'Trần Thị B', rating: 4.9, totalServices: 52 },
  { id: 3, name: 'Lê Văn C', rating: 4.7, totalServices: 38 },
  { id: 4, name: 'Phạm Thị D', rating: 4.6, totalServices: 41 },
];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function StaffServiceRequestPage({ params }: PageProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  
  const [requests, setRequests] = useState<ServiceRegistration[]>([
    {
      id: 1,
      customerId: 1,
      servicePackageId: 1,
      address: '123 Flower Street, HCM',
      phone: '+84 901 234 567',
      serviceDate: '2025-03-10',
      note: 'Plant is showing signs of disease, needs urgentcare',
      status: ServiceRegistrationStatus.PENDING_CONFIRMATION,
      createdAt: '2025-03-05T08:00:00Z',
      updatedAt: '2025-03-05T08:00:00Z',
    },
    {
      id: 2,
      customerId: 2,
      servicePackageId: 2,
      address: '456 Green Avenue, HCM',
      phone: '+84 912 345 678',
      serviceDate: '2025-03-12',
      note: 'Weekly care service for home garden',
      status: ServiceRegistrationStatus.PENDING_CONFIRMATION,
      createdAt: '2025-03-04T10:30:00Z',
      updatedAt: '2025-03-04T10:30:00Z',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRegistration | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleOpenConfirmDialog = (request: ServiceRegistration) => {
    setSelectedRequest(request);
    setSelectedCaretaker(null);
    setEstimatedDuration('');
    setConfirmDialogOpen(true);
  };

  const handleOpenRejectDialog = (request: ServiceRegistration) => {
    setSelectedRequest(request);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmRequest = async () => {
    if (!selectedRequest || !selectedCaretaker || !estimatedDuration) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Confirming request:', {
        requestId: selectedRequest.id,
        caretakerId: selectedCaretaker,
        estimatedDuration: parseInt(estimatedDuration),
      });

      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setConfirmDialogOpen(false);
      
      // Show success message
      alert('Service request confirmed successfully!');
    } catch (error) {
      console.error('Error confirming request:', error);
      alert('Failed to confirm request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Rejecting request:', {
        requestId: selectedRequest.id,
        reason: rejectReason,
      });

      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setRejectDialogOpen(false);
      
      // Show success message
      alert('Service request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('requestConfirmation')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('confirmAndCreate')} - {requests.length} pending request(s)
        </Typography>
      </Box>

      {/* Pending Requests Table */}
      {requests.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('serviceDate')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('address')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('phone')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('notes')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  {tCommon('action')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>#{request.id}</TableCell>
                  <TableCell>{new Date(request.serviceDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {request.address}
                  </TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {request.note}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleOpenConfirmDialog(request)}
                      >
                        {t('confirm')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={() => handleOpenRejectDialog(request)}
                      >
                        {t('reject')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ textAlign: 'center', py: 6, boxShadow: 2 }}>
          <CardContent>
            <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No pending service requests
            </Typography>
            <Typography color="text.secondary" variant="body2">
              All service requests have been processed
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('confirmAndCreate')} - Request #{selectedRequest?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box sx={{ space: 3 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('address')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedRequest.address}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('phone')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedRequest.phone}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('notes')}
                </Typography>
                <Typography variant="body2">{selectedRequest.note}</Typography>
              </Box>

              <Divider />

              <Box sx={{ mt: 3 }}>
                <TextField
                  select
                  fullWidth
                  label={t('selectCaretaker')}
                  value={selectedCaretaker || ''}
                  onChange={(e) => setSelectedCaretaker(Number(e.target.value))}
                  margin="normal"
                  required
                >
                  {MOCK_CARETAKERS.map((caretaker) => (
                    <MenuItem key={caretaker.id} value={caretaker.id}>
                      {caretaker.name} ⭐{caretaker.rating} ({caretaker.totalServices} services)
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label={t('estimatedDuration')}
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  margin="normal"
                  required
                  inputProps={{ min: '30', step: '15' }}
                  helperText={t('minEstimatedDuration')}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseConfirmDialog} disabled={loading}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleConfirmRequest}
            variant="contained"
            color="success"
            disabled={loading || !selectedCaretaker || !estimatedDuration}
          >
            {loading ? <CircularProgress size={20} /> : t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('reject')} - Request #{selectedRequest?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Are you sure you want to reject this service request?
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('rejectReason')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                margin="normal"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseRejectDialog} disabled={loading}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleRejectRequest}
            variant="contained"
            color="error"
            disabled={loading || !rejectReason.trim()}
          >
            {loading ? <CircularProgress size={20} /> : t('reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

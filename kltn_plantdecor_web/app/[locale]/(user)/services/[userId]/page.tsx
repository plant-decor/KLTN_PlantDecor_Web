'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  DifficultyLevel,
  ServiceRegistration,
  ServiceRegistrationStatus,
  ServiceType,
} from '@/types/service.types';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ServiceRequestTable from '@/components/service/ServiceRequestTable';
import ServiceDetailsDialog from '@/components/service/ServiceDetailsDialog';
import ServiceBookingDialog, { ServiceBookingData } from '@/components/service/ServiceBookingDialog';
import EmptyState from '@/components/service/EmptyState';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { toast } from 'react-toastify';
import {
  cancelServiceRegistration,
  createServiceRegistration,
  getMyServiceRegistrations,
  getServiceRegistrationDetail,
} from '@/lib/api/careServiceService';
import type { MyServiceRegistration } from '@/types/care-service.types';

interface PageProps {
  params: Promise<{ userid: string }>;
}

type ServiceRequestViewModel = ServiceRegistration & {
  statusNameRaw: string;
  scheduleDaysOfWeek?: number[];
};

export default function UserServicePage({ params }: PageProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  void params;
  const [requests, setRequests] = useState<ServiceRequestViewModel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestViewModel | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTarget, setCancelTarget] = useState<ServiceRequestViewModel | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const mapStatusName = (statusName: string): ServiceRegistrationStatus => {
    const normalized = statusName.toLowerCase();

    if (normalized.includes('pending') || normalized.includes('awaitpayment')) {
      return ServiceRegistrationStatus.PENDING_CONFIRMATION;
    }
    if (normalized.includes('confirm')) {
      return ServiceRegistrationStatus.CONFIRMED;
    }
    if (normalized.includes('reject')) {
      return ServiceRegistrationStatus.REJECTED;
    }
    if (normalized.includes('progress')) {
      return ServiceRegistrationStatus.IN_PROGRESS;
    }
    if (normalized.includes('complete')) {
      return ServiceRegistrationStatus.COMPLETED;
    }
    if (normalized.includes('cancel')) {
      return ServiceRegistrationStatus.CANCELLED;
    }

    return ServiceRegistrationStatus.PENDING_CONFIRMATION;
  };

  const canCancelByStatusName = useCallback((statusName: string): boolean => {
    const normalized = statusName.trim().toLowerCase();
    return normalized === 'pendingapproval' || normalized === 'awaitpayment';
  }, []);

  const mapApiToViewModel = useCallback(
    (registration: MyServiceRegistration): ServiceRequestViewModel => ({
      id: registration.id,
      customerId: registration.customer?.id ?? 0,
      servicePackageId: registration.nurseryCareService.careServicePackage.id,
      address: registration.address,
      phone: registration.phone,
      serviceDate: registration.serviceDate,
      note: registration.note,
      status: mapStatusName(registration.statusName),
      statusNameRaw: registration.statusName,
      cancelReason: registration.cancelReason ?? undefined,
      mainCaretakerId: undefined,
      estimatedDuration: undefined,
      createdAt: registration.createdAt,
      updatedAt: registration.approvedAt ?? registration.createdAt,
      servicePackage: {
        id: registration.nurseryCareService.careServicePackage.id,
        name: registration.nurseryCareService.careServicePackage.name,
        description: registration.nurseryCareService.careServicePackage.description,
        features: [],
        serviceType:
          registration.nurseryCareService.careServicePackage.serviceType === 1 ? ServiceType.ONETIME : ServiceType.PERIODIC,
        durationDays: registration.nurseryCareService.careServicePackage.durationDays,
        difficultyLevel: DifficultyLevel.MEDIUM,
        areaLimit: 0,
        unitPrice: registration.nurseryCareService.careServicePackage.unitPrice,
        isActive: true,
        createdAt: registration.createdAt,
        updatedAt: registration.createdAt,
      },
      scheduleDaysOfWeek: registration.scheduleDaysOfWeek,
    }),
    []
  );

  const loadMyRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyServiceRegistrations({ pageNumber: 1, pageSize: 10 }, false);
      setRequests(response.items.map(mapApiToViewModel));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : t('errorFetching');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mapApiToViewModel, t]);

  useEffect(() => {
    void loadMyRegistrations();
  }, [loadMyRegistrations]);

  const handleViewDetails = async (request: ServiceRegistration) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const detail = await getServiceRegistrationDetail(request.id, false);
      setSelectedRequest(mapApiToViewModel(detail));
    } catch (detailError) {
      const message = detailError instanceof Error ? detailError.message : t('errorFetching');
      toast.error(message);
      setDetailOpen(false);
      setSelectedRequest(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
    setDetailLoading(false);
  };

  const handleOpenBooking = () => {
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
  };

  const handleSubmitBooking = async (data: ServiceBookingData) => {
    try {
      await createServiceRegistration(
        {
          nurseryCareServiceId: data.nurseryCareServiceId,
          serviceDate: data.serviceDate,
          scheduleDaysOfWeek: data.scheduleDaysOfWeek,
          preferredShiftId: 1,
          address: data.address,
          phone: data.phone,
          note: data.note,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        false
      );
      await loadMyRegistrations();
      setSuccessMessage(t('requestSubmitted'));
      toast.success(t('requestSubmitted'));
      setBookingOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errorFetching');
      toast.error(message);
      setError(message);
    }
  };

  const handleOpenCancel = (request: ServiceRegistration) => {
    const found = requests.find((item) => item.id === request.id);
    if (!found || !canCancelByStatusName(found.statusNameRaw)) {
      return;
    }

    setCancelReason('');
    setCancelTarget(found);
    setCancelOpen(true);
  };

  const handleCloseCancel = () => {
    setCancelOpen(false);
    setCancelReason('');
    setCancelTarget(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    if (!cancelReason.trim()) {
      toast.error(t('cancelReasonRequired'));
      return;
    }

    try {
      setCancelSubmitting(true);
      const cancelled = await cancelServiceRegistration(cancelTarget.id, cancelReason, false);
      const cancelledViewModel = mapApiToViewModel(cancelled);

      setRequests((prev) => prev.map((item) => (item.id === cancelledViewModel.id ? cancelledViewModel : item)));
      setSelectedRequest((prev) => (prev?.id === cancelledViewModel.id ? cancelledViewModel : prev));
      toast.success(t('cancelServiceSuccess'));
      setSuccessMessage(t('cancelServiceSuccess'));
      handleCloseCancel();
      await loadMyRegistrations();
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : t('cancelServiceFailed');
      toast.error(message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const selectedRequestCanCancel = useMemo(
    () => (selectedRequest ? canCancelByStatusName(selectedRequest.statusNameRaw) : false),
    [canCancelByStatusName, selectedRequest]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('myRequests')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('myRequestsDesc')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenBooking}
          sx={{ minWidth: 180, backgroundColor: 'var(--primary)', fontWeight: 'bold', ...hoverLiftStyle }}
        >
          {t('bookService')}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Service Requests Table */}
      {requests.length > 0 ? (
        <ServiceRequestTable
          requests={requests}
          onViewDetails={handleViewDetails}
          showStatus={true}
          showCaretaker={false}
          actionButtons={(request) => {
            const found = requests.find((item) => item.id === request.id);
            const canCancel = found ? canCancelByStatusName(found.statusNameRaw) : false;

            return (
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="outlined" size="small" onClick={() => void handleViewDetails(request)}>
                  {tCommon('view')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<CancelOutlinedIcon />}
                  disabled={!canCancel}
                  onClick={() => handleOpenCancel(request)}
                >
                  {t('cancel')}
                </Button>
              </Stack>
            );
          }}
        />
      ) : (
        <EmptyState
          icon={<StorageIcon />}
          title={t('noRequests')}
          description={t('noRequestsDesc')}
        />
      )}

      {/* Service Details Dialog */}
      <ServiceDetailsDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        service={selectedRequest}
        loading={detailLoading}
        onCancel={selectedRequestCanCancel && selectedRequest ? () => handleOpenCancel(selectedRequest) : undefined}
      />

      {/* Service Booking Dialog */}
      <ServiceBookingDialog
        open={bookingOpen}
        onClose={handleCloseBooking}
        onSubmit={handleSubmitBooking}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Dialog open={cancelOpen} onClose={handleCloseCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('cancelServiceTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('cancelServiceDescription')}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            autoFocus
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            label={t('cancelReason')}
            placeholder={t('enterCancelReason')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancel} color="inherit">
            {tCommon('close')}
          </Button>
          <Button
            onClick={() => void handleConfirmCancel()}
            color="error"
            variant="contained"
            disabled={cancelSubmitting}
            sx={{ ...hoverLiftStyle }}
          >
            {t('cancelServiceAction')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

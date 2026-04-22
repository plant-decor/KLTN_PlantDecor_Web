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
  getSystemEnumValues,
  getMyServiceRegistrations,
  getServiceRegistrationDetail,
} from '@/lib/api/careServiceService';
import { createPaymentUrlByOrderId } from '@/lib/api/orderService';
import type { EnumOption, MyServiceRegistration } from '@/types/care-service.types';
import { ServiceRegistrationStatusEnum } from '@/types/care-service.types';

interface PageProps {
  params: Promise<{ userid: string }>;
}

type ServiceRequestViewModel = ServiceRegistration & {
  statusNameRaw: string;
  scheduleDaysOfWeek?: number[];
  totalSessions?: number;
  orderId?: number | null;
  nurseryName?: string;
  packageName?: string;
  packageDescription?: string;
  packageVisitPerWeek?: number;
  preferredShift?: {
    id: number;
    shiftName: string;
    startTime: string;
    endTime: string;
  } | null;
  customerName?: string;
  customerEmail?: string;
  latitude?: number;
  longitude?: number;
  progressesCount?: number;
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
  const [paymentSubmittingId, setPaymentSubmittingId] = useState<number | null>(null);
  const [statusEnums, setStatusEnums] = useState<EnumOption[]>([]);

  const normalizeStatusName = useCallback((value?: string | null) => {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }, []);

  const formatStatusLabel = useCallback((value: string) => {
    if (!value) {
      return '';
    }

    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const statusLabelMap = useMemo(() => {
    return statusEnums.reduce<Record<number, string>>((accumulator, option) => {
      accumulator[option.value] = formatStatusLabel(option.name);
      return accumulator;
    }, {});
  }, [formatStatusLabel, statusEnums]);

  const getStatusCode = useCallback((status: ServiceRequestViewModel['status'], statusNameRaw?: string) => {
    if (typeof status === 'number') {
      // Gộp status 0 và 1 thành PendingApproval cho customer
      if (status === 0 || status === 1) return ServiceRegistrationStatusEnum.PendingApproval;
      return status;
    }

    const numericStatus = Number(status);
    if (!Number.isNaN(numericStatus) && String(status).trim() !== '') {
      if (numericStatus === 0 || numericStatus === 1) return ServiceRegistrationStatusEnum.PendingApproval;
      return numericStatus;
    }

    const normalized = normalizeStatusName(status || statusNameRaw);

    if (normalized === 'waitingfornursery' || normalized === 'pendingapproval' || normalized === 'pendingconfirmation') {
      return ServiceRegistrationStatusEnum.PendingApproval;
    }
    if (normalized === 'awaitpayment' || normalized === 'confirmed') {
      return ServiceRegistrationStatusEnum.AwaitPayment;
    }
    if (normalized === 'active' || normalized === 'inprogress') {
      return ServiceRegistrationStatusEnum.Active;
    }
    if (normalized === 'completed') {
      return ServiceRegistrationStatusEnum.Completed;
    }
    if (normalized === 'cancelled') {
      return ServiceRegistrationStatusEnum.Cancelled;
    }
    if (normalized === 'rejected') {
      return ServiceRegistrationStatusEnum.Rejected;
    }

    return null;
  }, [normalizeStatusName]);

  const canCancelByStatus = useCallback(
    (status: ServiceRequestViewModel['status'], statusNameRaw?: string): boolean => {
      const statusCode = getStatusCode(status, statusNameRaw);
      return statusCode === ServiceRegistrationStatusEnum.PendingApproval || statusCode === ServiceRegistrationStatusEnum.AwaitPayment;
    },
    [getStatusCode]
  );

  const canPayByStatus = useCallback(
    (status: ServiceRequestViewModel['status'], statusNameRaw?: string, orderId?: number | null): boolean => {
      return !!orderId && getStatusCode(status, statusNameRaw) === ServiceRegistrationStatusEnum.AwaitPayment;
    },
    [getStatusCode]
  );

  const mapStatusToViewValue = useCallback((status: number | string): number | ServiceRegistrationStatus => {
    if (typeof status === 'number') {
      if (status === 0 || status === 1) return ServiceRegistrationStatusEnum.PendingApproval;
      return status;
    }

    const numericStatus = Number(status);
    if (!Number.isNaN(numericStatus) && String(status).trim() !== '') {
      if (numericStatus === 0 || numericStatus === 1) return ServiceRegistrationStatusEnum.PendingApproval;
      return numericStatus;
    }

    const normalized = normalizeStatusName(status);
    if (normalized === 'waitingfornursery' || normalized === 'pendingapproval' || normalized === 'pendingconfirmation') {
      return ServiceRegistrationStatusEnum.PendingApproval;
    }
    if (normalized === 'awaitpayment' || normalized === 'confirmed') {
      return ServiceRegistrationStatusEnum.AwaitPayment;
    }
    if (normalized === 'active' || normalized === 'inprogress') {
      return ServiceRegistrationStatusEnum.Active;
    }
    if (normalized === 'completed') {
      return ServiceRegistrationStatusEnum.Completed;
    }
    if (normalized === 'cancelled') {
      return ServiceRegistrationStatusEnum.Cancelled;
    }
    if (normalized === 'rejected') {
      return ServiceRegistrationStatusEnum.Rejected;
    }

    return ServiceRegistrationStatus.PENDING_CONFIRMATION;
  }, [normalizeStatusName]);

  useEffect(() => {
    const loadStatusEnums = async () => {
      try {
        const enums = await getSystemEnumValues('service-registrations', false);
        setStatusEnums(enums);
      } catch {
        setStatusEnums([]);
      }
    };

    void loadStatusEnums();
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
      status: mapStatusToViewValue(registration.status),
      statusNameRaw: registration.statusName,
      cancelReason: registration.cancelReason ?? undefined,
      totalSessions: registration.totalSessions,
      orderId: registration.orderId,
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
      nurseryName: registration.nurseryCareService.nurseryName,
      packageName: registration.nurseryCareService.careServicePackage.name,
      packageDescription: registration.nurseryCareService.careServicePackage.description,
      packageVisitPerWeek: registration.nurseryCareService.careServicePackage.visitPerWeek,
      preferredShift: registration.prefferedShift
        ? {
            id: registration.prefferedShift.id,
            shiftName: registration.prefferedShift.shiftName,
            startTime: registration.prefferedShift.startTime,
            endTime: registration.prefferedShift.endTime,
          }
        : null,
      customerName: registration.customer?.fullName,
      customerEmail: registration.customer?.email,
      latitude: registration.latitude,
      longitude: registration.longitude,
      scheduleDaysOfWeek: registration.scheduleDaysOfWeek,
      progressesCount: registration.progresses.length,
    }),
    [mapStatusToViewValue]
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

  const handlePayRegistration = useCallback(
    async (request: ServiceRegistration) => {
      if (!request.orderId) {
        toast.error(t('paymentOrderMissing'));
        return;
      }

      try {
        setPaymentSubmittingId(request.id);
        const paymentUrl = await createPaymentUrlByOrderId(request.orderId);
        window.location.assign(paymentUrl);
      } catch (payError) {
        const message = payError instanceof Error ? payError.message : t('paymentFailed');
        toast.error(message);
      } finally {
        setPaymentSubmittingId(null);
      }
    },
    [t]
  );

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
          careServicePackageId: data.careServicePackageId,
          preferredNurseryId: data.preferredNurseryId,
          serviceDate: data.serviceDate,
          scheduleDaysOfWeek: data.scheduleDaysOfWeek,
          preferredShiftId: data.preferredShiftId,
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
    if (!found || !canCancelByStatus(found.status, found.statusNameRaw)) {
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
    () => (selectedRequest ? canCancelByStatus(selectedRequest.status, selectedRequest.statusNameRaw) : false),
    [canCancelByStatus, selectedRequest]
  );

  const selectedRequestCanPay = useMemo(
    () => (selectedRequest ? canPayByStatus(selectedRequest.status, selectedRequest.statusNameRaw, selectedRequest.orderId) : false),
    [canPayByStatus, selectedRequest]
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
          statusLabels={statusLabelMap}
          actionButtons={(request) => {
            const found = requests.find((item) => item.id === request.id);
            const canCancel = found ? canCancelByStatus(found.status, found.statusNameRaw) : false;
            const canPay = found ? canPayByStatus(found.status, found.statusNameRaw, found.orderId) : false;

            return (
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button sx={hoverLiftStyle} variant="outlined" size="small" onClick={() => void handleViewDetails(request)}>
                  {tCommon('view')}
                </Button>
                {canPay ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => void handlePayRegistration(request)}
                    disabled={paymentSubmittingId === request.id}
                    sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
                  >
                    {paymentSubmittingId === request.id ? t('creatingPayment') : t('payNow')}
                  </Button>
                ) : null}
                {canCancel ? (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  className='bg-error! text-white!'
                  startIcon={<CancelOutlinedIcon />}
                  disabled={!canCancel}
                  onClick={() => handleOpenCancel(request)}
                  sx={hoverLiftStyle}
                >
                  {t('cancel')}
                </Button>
                ) : null}
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
        canCancel={selectedRequestCanCancel}
        canPay={selectedRequestCanPay}
        paying={paymentSubmittingId === selectedRequest?.id}
        statusLabels={statusLabelMap}
        onPay={selectedRequest ? () => void handlePayRegistration(selectedRequest) : undefined}
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
            className='text-white!'
          >
            {t('cancelServiceAction')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

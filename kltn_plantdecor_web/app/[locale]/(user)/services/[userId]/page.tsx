'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  DifficultyLevel,
  ServiceRegistration,
  ServiceRegistrationStatus,
  ServiceType,
} from '@/types/service.types';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import StarIcon from '@mui/icons-material/Star';
import ServiceRequestTable from '@/components/service/ServiceRequestTable';
import ServiceDetailsDialog from '@/components/service/ServiceDetailsDialog';
import ServiceBookingDialog, { ServiceBookingData } from '@/components/service/ServiceBookingDialog';
import DesignRegistrationPageClient from '@/components/design-registration/DesignRegistrationPageClient';
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
import type { EnumOption, MyServiceRegistration, ServiceRegistrationRating } from '@/types/care-service.types';
import { ServiceRegistrationStatusEnum } from '@/types/care-service.types';
import {
  getServiceRatingByRegistration,
  ratingPayloadToRegistrationRating,
} from '@/lib/api/serviceRatingService';
import { ServiceRatingSubmitDialog } from '@/components/service/ServiceRatingDialogs';
import { CustomLoading } from '@/components/CustomLoading';
import { useServicePageQueryAction } from '@/hooks/services/useServicePageQueryAction';

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
  rating?: ServiceRegistrationRating | null;
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
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentSubmittingId, setPaymentSubmittingId] = useState<number | null>(null);
  const [statusEnums, setStatusEnums] = useState<EnumOption[]>([]);
  const [bookingInitialPackageId, setBookingInitialPackageId] = useState<number | null>(null);
  const [autoBookConsumed, setAutoBookConsumed] = useState(false);
  const [ratingSubmitOpen, setRatingSubmitOpen] = useState(false);
  const [ratingSubmitRegistrationId, setRatingSubmitRegistrationId] = useState<number | null>(null);
  const [customerRatingRefreshKey, setCustomerRatingRefreshKey] = useState(0);

  const {
    initialPackageId: queryPackageId,
    shouldAutoBook,
    tab: queryTab,
    clearAction,
  } = useServicePageQueryAction();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthBootstrapCompleted = useAuthStore(
    (state) => state.isAuthBootstrapCompleted,
  );

  useEffect(() => {
    const nextTab = queryTab === 'design' ? 1 : 0;
    setCurrentTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [queryTab]);

  useEffect(() => {
    if (!isAuthBootstrapCompleted) return;
    if (isAuthenticated) return;

    const search = searchParams.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;
    router.replace(`/login?redirectTo=${encodeURIComponent(fullPath)}`);
  }, [
    isAuthBootstrapCompleted,
    isAuthenticated,
    pathname,
    router,
    searchParams,
  ]);

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

  const hasValidServiceRating = useCallback((row: ServiceRequestViewModel) => {
    const r = row.rating;
    return (
      !!r &&
      Number.isFinite(r.id) &&
      r.id > 0 &&
      Number.isFinite(r.score) &&
      r.score >= 1 &&
      r.score <= 5
    );
  }, []);

  const isRowCompleted = useCallback(
    (row: ServiceRequestViewModel) => {
      if (getStatusCode(row.status, row.statusNameRaw) === ServiceRegistrationStatusEnum.Completed) {
        return true;
      }
      if (normalizeStatusName(row.statusNameRaw) === 'completed') {
        return true;
      }
      const n = Number(row.status);
      return Number.isFinite(n) && n === ServiceRegistrationStatusEnum.Completed;
    },
    [getStatusCode, normalizeStatusName]
  );

  const canRateService = useCallback(
    (row: ServiceRequestViewModel) => {
      return isRowCompleted(row) && !hasValidServiceRating(row);
    },
    [isRowCompleted, hasValidServiceRating]
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
      rating: registration.rating ?? null,
    }),
    [mapStatusToViewValue]
  );

  const loadMyRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyServiceRegistrations({ pageNumber: 1, pageSize: 10 }, false);
      const items = await Promise.all(
        response.items.map(async (reg) => {
          const regCompleted =
            Number(reg.status) === ServiceRegistrationStatusEnum.Completed ||
            normalizeStatusName(reg.statusName) === 'completed';
          const er = reg.rating;
          const hasEmbeddedRating =
            !!er &&
            Number.isFinite(er.id) &&
            er.id > 0 &&
            Number.isFinite(er.score) &&
            er.score >= 1 &&
            er.score <= 5;
          if (regCompleted && !hasEmbeddedRating) {
            const fetched = await getServiceRatingByRegistration(reg.id, false);
            if (fetched) {
              return mapApiToViewModel({
                ...reg,
                rating: ratingPayloadToRegistrationRating(fetched),
              });
            }
          }
          return mapApiToViewModel(reg);
        })
      );
      setRequests(items);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : t('errorFetching');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mapApiToViewModel, normalizeStatusName, t]);

  useEffect(() => {
    if (isAuthBootstrapCompleted && !isAuthenticated) {
      return;
    }
    void loadMyRegistrations();
  }, [loadMyRegistrations, isAuthBootstrapCompleted, isAuthenticated]);

  useEffect(() => {
    if (!detailOpen) return;
    setSelectedRequest((prev) => {
      if (!prev) return prev;
      const updated = requests.find((r) => r.id === prev.id);
      return updated ?? prev;
    });
  }, [requests, detailOpen]);

  useEffect(() => {
    if (loading) return;
    if (autoBookConsumed) return;
    if (!shouldAutoBook || !queryPackageId) return;
    if (isAuthBootstrapCompleted && !isAuthenticated) return;

    setCurrentTab(0);
    setBookingInitialPackageId(queryPackageId);
    setBookingOpen(true);
    setAutoBookConsumed(true);
    clearAction();
  }, [
    loading,
    shouldAutoBook,
    queryPackageId,
    autoBookConsumed,
    clearAction,
    isAuthBootstrapCompleted,
    isAuthenticated,
  ]);

  const handleViewDetails = async (request: ServiceRegistration) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const detail = await getServiceRegistrationDetail(request.id, false);
      const listRow = requests.find((r) => Number(r.id) === Number(detail.id));
      const detailCompleted =
        Number(detail.status) === ServiceRegistrationStatusEnum.Completed ||
        normalizeStatusName(detail.statusName) === 'completed';

      let registrationForVm: MyServiceRegistration = detail;

      if (detailCompleted && !detail.rating && listRow?.rating) {
        const lr = listRow.rating;
        if (
          Number.isFinite(lr.id) &&
          lr.id > 0 &&
          Number.isFinite(lr.score) &&
          lr.score >= 1 &&
          lr.score <= 5
        ) {
          registrationForVm = { ...detail, rating: lr };
        }
      }

      if (detailCompleted && !registrationForVm.rating) {
        const fetched = await getServiceRatingByRegistration(detail.id, false);
        if (fetched) {
          registrationForVm = {
            ...registrationForVm,
            rating: ratingPayloadToRegistrationRating(fetched),
          };
        }
      }
      setSelectedRequest(mapApiToViewModel(registrationForVm));
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
    setBookingInitialPackageId(null);
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

  const handleTabChange = useCallback(
    (_event: unknown, newValue: number) => {
      setCurrentTab(newValue);
      if (!pathname) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newValue === 1 ? 'design' : 'care');
      if (newValue === 1) {
        params.delete('packageId');
        params.delete('action');
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const selectedRequestCanCancel = useMemo(
    () => (selectedRequest ? canCancelByStatus(selectedRequest.status, selectedRequest.statusNameRaw) : false),
    [canCancelByStatus, selectedRequest]
  );

  const selectedRequestCanPay = useMemo(
    () => (selectedRequest ? canPayByStatus(selectedRequest.status, selectedRequest.statusNameRaw, selectedRequest.orderId) : false),
    [canPayByStatus, selectedRequest]
  );

  if (loading && currentTab === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CustomLoading size={18} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('myRequests')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('myRequestsDesc')}
        </Typography>
      </Box>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
      >
        <Tab label="Care Service" />
        <Tab label="Design Service" />
      </Tabs>

      {currentTab === 0 ? (
        <>
          {/* Page Header */}
          <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
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
                const row = request as ServiceRequestViewModel;
                const found =
                  requests.find((item) => Number(item.id) === Number(request.id)) ?? row;
                const canCancel = canCancelByStatus(found.status, found.statusNameRaw);
                const canPay = canPayByStatus(found.status, found.statusNameRaw, found.orderId);
                const showRate = canRateService(row);

                return (
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                    <Button className="bg-transparent! rounded-full!" sx={hoverLiftStyle}  size="small" onClick={() => void handleViewDetails(request)}>
                      <VisibilityIcon
                        fontSize="medium" className="hover:scale-110" />
                    </Button>
                    {showRate ? (
                      <Tooltip title="Submit rating">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="Submit rating"
                          onClick={() => {
                            setRatingSubmitRegistrationId(Number(request.id));
                            setRatingSubmitOpen(true);
                          }}
                          sx={{ ...hoverLiftStyle, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                        >
                          <StarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
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
            customerRatingRefreshKey={customerRatingRefreshKey}
          />

          <ServiceRatingSubmitDialog
            open={ratingSubmitOpen}
            registrationId={ratingSubmitRegistrationId}
            onClose={() => {
              setRatingSubmitOpen(false);
              setRatingSubmitRegistrationId(null);
            }}
            onSubmitted={() => {
              void loadMyRegistrations().then(() => setCustomerRatingRefreshKey((k) => k + 1));
            }}
          />

          <ServiceBookingDialog
            open={bookingOpen}
            onClose={handleCloseBooking}
            onSubmit={handleSubmitBooking}
            initialPackageId={bookingInitialPackageId}
          />
        </>
      ) : (
        <Box sx={{ mt: 3 }}>
          <DesignRegistrationPageClient />
        </Box>
      )}

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



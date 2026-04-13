'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration, ServiceRegistrationStatus } from '@/types/service.types';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import ServiceRequestTable from '@/components/service/ServiceRequestTable';
import ServiceDetailsDialog from '@/components/service/ServiceDetailsDialog';
import ServiceBookingDialog, { ServiceBookingData } from '@/components/service/ServiceBookingDialog';
import EmptyState from '@/components/service/EmptyState';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { toast } from 'react-toastify';
import { createServiceRegistration } from '@/lib/api/careServiceService';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default function UserServicePage({ params }: PageProps) {
  const t = useTranslations('services');
  void params;
  const [requests, setRequests] = useState<ServiceRegistration[]>([]);

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleViewDetails = (request: ServiceRegistration) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
  };

  const handleOpenBooking = () => {
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
  };

  const mapStatusName = (statusName: string): ServiceRegistrationStatus => {
    const normalized = statusName.toLowerCase();

    if (normalized.includes('pending')) {
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

  const handleSubmitBooking = async (data: ServiceBookingData) => {
    try {
      const created = await createServiceRegistration(
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

      const newRequest: ServiceRegistration = {
        id: created.id,
        customerId: 0,
        servicePackageId: created.nurseryCareService.careServicePackage.id,
        address: created.address,
        phone: created.phone,
        serviceDate: created.serviceDate,
        note: created.note,
        status: mapStatusName(created.statusName),
        createdAt: created.createdAt,
        updatedAt: created.createdAt,
      };

      setRequests((prev) => [newRequest, ...prev]);
      setSuccessMessage(t('requestSubmitted'));
      toast.success(t('requestSubmitted'));
      setBookingOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errorFetching');
      toast.error(message);
      setError(message);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

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
    </Box>
  );
}

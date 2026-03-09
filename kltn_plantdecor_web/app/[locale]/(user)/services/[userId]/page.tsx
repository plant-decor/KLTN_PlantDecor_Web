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

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default function UserServicePage({ params }: PageProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  const [requests, setRequests] = useState<ServiceRegistration[]>([
    {
      id: 1,
      customerId: 1,
      servicePackageId: 1,
      address: '123 Green Street, Ho Chi Minh City',
      phone: '+84 123 456 789',
      serviceDate: '2025-03-10',
      note: 'My plant needs urgent care',
      status: ServiceRegistrationStatus.PENDING_CONFIRMATION,
      createdAt: '2025-03-05T10:00:00Z',
      updatedAt: '2025-03-05T10:00:00Z',
    },
    {
      id: 2,
      customerId: 1,
      servicePackageId: 2,
      address: '456 Flower Avenue, Ho Chi Minh City',
      phone: '+84 123 456 789',
      serviceDate: '2025-03-15',
      note: 'Design consultation for small balcony',
      status: ServiceRegistrationStatus.CONFIRMED,
      createdAt: '2025-02-28T14:30:00Z',
      updatedAt: '2025-03-01T09:00:00Z',
      mainCaretakerId: 1,
      estimatedDuration: 120,
    },
    {
      id: 3,
      customerId: 1,
      servicePackageId: 1,
      address: '789 Plant Lane, Ho Chi Minh City',
      phone: '+84 123 456 789',
      serviceDate: '2025-02-20',
      note: 'Regular monthly care service',
      status: ServiceRegistrationStatus.COMPLETED,
      createdAt: '2025-02-15T11:00:00Z',
      updatedAt: '2025-02-20T16:00:00Z',
      mainCaretakerId: 2,
      estimatedDuration: 90,
    },
  ]);

  const [loading, setLoading] = useState(false);
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

  const handleSubmitBooking = (data: ServiceBookingData) => {
    // Create new service request
    const newRequest: ServiceRegistration = {
      id: requests.length + 1,
      customerId: 1,
      servicePackageId: data.servicePackageId,
      address: data.address,
      phone: data.phone,
      serviceDate: data.serviceDate,
      note: data.note,
      status: ServiceRegistrationStatus.PENDING_CONFIRMATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests([newRequest, ...requests]);
    setSuccessMessage(t('requestSubmitted'));
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

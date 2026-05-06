'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { ServiceProgressDetail } from '@/types/care-service.types';
import ServiceRatingReadOnlySection from '@/components/service/ServiceRatingReadOnlySection';
import { formatDateTime } from '@/components/manager/return-ticket-management/managerReturnTicket.constants';
import { formatDate } from '../service-orders/managerServiceOrders.constants';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';

interface ServiceProgressDetailDialogProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: ServiceProgressDetail | null;
  onClose: () => void;
}


interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant='body2' fontWeight={500}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export default function ServiceProgressDetailDialog({
  open,
  loading,
  error,
  detail,
  onClose,
}: ServiceProgressDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Care session details #{detail?.id || '-'}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && <Typography>Loading details...</Typography>}

        {!loading && error && <Alert severity='error'>{error}</Alert>}

        {!loading && !error && detail && (
          <Stack spacing={2}>
            <DetailRow label='Service date' value={detail.taskDate ? formatDate(detail.taskDate) : '-'} />
            <DetailRow
              label='Shift'
              value={detail.shift ? `${detail.shift.shiftName} (${detail.shift.startTime} - ${detail.shift.endTime})` : '-'}
            />
            <DetailRow label='Status' value={detail.statusName || '-'} />
            <DetailRow label='Actual start time' value={detail.actualStartTime ? formatDateTime(detail.actualStartTime) : '-'} />
            <DetailRow label='Actual end time' value={detail.actualEndTime ? formatDateTime(detail.actualEndTime) : '-'} />
            <DetailRow label='Task description' value={detail.description || '-'} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle1' fontWeight={700}>
              Customer information
            </Typography>
            <DetailRow label='Customer' value={detail.serviceRegistration?.customer?.fullName || '-'} />
            <DetailRow label='Email' value={detail.serviceRegistration?.customer?.email || '-'} />
            <DetailRow label='Phone' value={detail.serviceRegistration?.phone || '-'} />
            <DetailRow label='Service address' value={detail.serviceRegistration?.address || '-'} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle1' fontWeight={700}>
              Service information
            </Typography>
            <DetailRow
              label='Service package'
              value={detail.serviceRegistration?.nurseryCareService.careServicePackage.name || '-'}
            />
            <DetailRow label='Assigned nursery' value={detail.serviceRegistration?.nurseryCareService.nurseryName || '-'} />
            <DetailRow label='Current caretaker' value={detail.caretaker?.fullName || 'Unassigned'} />
            {detail.hasIncidents && (
              <Box>
                <DetailRow label='Incidents' value={detail.incidentReason || '-'} />
                <Typography sx={{ my: 0.75, fontWeight: 700 }}>
                  Incidents Image
                </Typography>
                {detail.incidentImageUrl&& (
                  <ClickableImageViewer
                    images={[detail.incidentImageUrl]}
                    alt='Incident photo'
                    containerClassName='w-1/2 bg-gray-100'
                    showZoomHint={true}
                  />
                )}
              </Box>
            )}
            {detail.evidenceImageUrl && (
              <Box>
                <Typography sx={{ mb: 0.75, fontWeight: 700 }}>
                  Evidence photo
                </Typography>
                <Box
                  component='img'
                  src={detail.evidenceImageUrl}
                  alt='Evidence photo'
                  sx={{ width: '100%', maxHeight: 260, borderRadius: 2, objectFit: 'cover' }}
                />
              </Box>
            )}

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle1' fontWeight={700}>
              Service rating
            </Typography>
            <ServiceRatingReadOnlySection
              registrationId={detail.serviceRegistrationId}
              enabled={open && Boolean(detail.serviceRegistrationId) && !loading && !error}
            />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration } from '@/types/service.types';
import ServiceStatusChip from './ServiceStatusChip';

interface ExtendedServiceRegistration extends ServiceRegistration {
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
  scheduleDaysOfWeek?: number[];
  latitude?: number;
  longitude?: number;
  progressesCount?: number;
}

interface ServiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  service: ExtendedServiceRegistration | null;
  loading?: boolean;
  canCancel?: boolean;
  canPay?: boolean;
  paying?: boolean;
  onPay?: () => void;
  onCancel?: () => void;
}

export default function ServiceDetailsDialog({
  open,
  onClose,
  service,
  loading = false,
  canCancel = false,
  canPay = false,
  paying = false,
  onPay,
  onCancel,
}: ServiceDetailsDialogProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const formatDate = (date?: string) => {
    if (!date) {
      return '-';
    }

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString();
  };

  const formatDateTime = (date?: string) => {
    if (!date) {
      return '-';
    }

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString();
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return '-';
    }

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShift = (
    shift?: {
      id: number;
      shiftName: string;
      startTime: string;
      endTime: string;
    } | null
  ) => {
    if (!shift) {
      return '-';
    }

    return `${shift.shiftName} (${shift.startTime} - ${shift.endTime})`;
  };

  const formatScheduleDays = (days?: number[]) => {
    if (!Array.isArray(days) || days.length === 0) {
      return '-';
    }

    const weekdayByIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days
      .map((day) => weekdayByIndex[day] ?? String(day))
      .join(', ');
  };

  const renderReadOnlyField = (label: string, value: string, multiline = false) => (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        value={value}
        InputProps={{ readOnly: true }}
      />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {service ? `${t('serviceRequest')} #${service.id}` : t('serviceRequest')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : !service ? (
          <Typography variant="body2" color="text.secondary">
            {t('errorFetching')}
          </Typography>
        ) : (
          <Grid container spacing={2}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('status')}
            </Typography>
            <ServiceStatusChip status={service.status} />
          </Box>

          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('serviceDate'), formatDate(service.serviceDate))}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('createdAt'), formatDateTime(service.createdAt))}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('providerNursery'), service.nurseryName || '-')}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReadOnlyField(t('servicePackage'), service.packageName || service.servicePackage?.name || '-')}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('totalSessions'), String(service.totalSessions ?? '-'))}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReadOnlyField(
              t('price'),
              formatCurrency(service.servicePackage?.unitPrice)
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('shift'), formatShift(service.preferredShift))}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReadOnlyField(t('scheduleDays'), formatScheduleDays(service.scheduleDaysOfWeek))}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>{renderReadOnlyField(t('phone'), service.phone || '-')}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderReadOnlyField(t('orderId'), service.orderId ? `#${service.orderId}` : '-')}
          </Grid>
          <Grid size={{ xs: 12 }}>{renderReadOnlyField(t('address'), service.address || '-', true)}</Grid>
          <Grid size={{ xs: 12 }}>{renderReadOnlyField(t('notes'), service.note || '-', true)}</Grid>

          {service.packageDescription ? (
            <Grid size={{ xs: 12 }}>{renderReadOnlyField(t('packageDescription'), service.packageDescription, true)}</Grid>
          ) : null}

          {service.cancelReason ? (
            <Grid size={{ xs: 12 }}>{renderReadOnlyField(t('cancelReason'), service.cancelReason, true)}</Grid>
          ) : null}
        </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {canPay && onPay ? (
          <Button variant="contained" onClick={onPay} disabled={paying} sx={{ backgroundColor: 'var(--primary)' }}>
            {paying ? t('creatingPayment') : t('payNow')}
          </Button>
        ) : null}
        {onCancel && canCancel ? (
          <Button color="error" onClick={onCancel} >
            {t('cancel')}
          </Button>
        ) : null}
        <Button onClick={onClose}>{tCommon('close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration } from '@/types/service.types';
import ServiceStatusChip from './ServiceStatusChip';

interface ServiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  service: ServiceRegistration | null;
}

export default function ServiceDetailsDialog({
  open,
  onClose,
  service,
}: ServiceDetailsDialogProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  if (!service) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {t('serviceRequest')} #{service.id}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ space: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('status')}
            </Typography>
            <ServiceStatusChip status={service.status} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('serviceDate')}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={new Date(service.serviceDate).toLocaleDateString()}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('address')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={service.address}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('phone')}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={service.phone}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('notes')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={service.note}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {service.mainCaretakerId && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('caretaker')}
              </Typography>
              <Typography variant="body2">
                {service.caretaker?.name || 'Caretaker #' + service.mainCaretakerId}
              </Typography>
            </Box>
          )}

          {service.estimatedDuration && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('estimatedDuration')}
              </Typography>
              <Typography variant="body2">
                {service.estimatedDuration} {t('minEstimatedDuration')}
              </Typography>
            </Box>
          )}

          {service.cancelReason && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cancellation Reason
              </Typography>
              <Typography variant="body2">{service.cancelReason}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{tCommon('close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

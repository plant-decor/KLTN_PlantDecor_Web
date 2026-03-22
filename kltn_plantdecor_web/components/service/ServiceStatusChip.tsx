'use client';

import { Chip } from '@mui/material';
import { ServiceRegistrationStatus } from '@/types/service.types';
import { useTranslations } from 'next-intl';

interface ServiceStatusChipProps {
  status: ServiceRegistrationStatus;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
}

export const getStatusColor = (status: ServiceRegistrationStatus) => {
  const colors: Record<ServiceRegistrationStatus, any> = {
    [ServiceRegistrationStatus.PENDING_CONFIRMATION]: 'warning',
    [ServiceRegistrationStatus.CONFIRMED]: 'info',
    [ServiceRegistrationStatus.REJECTED]: 'error',
    [ServiceRegistrationStatus.IN_PROGRESS]: 'primary',
    [ServiceRegistrationStatus.COMPLETED]: 'success',
    [ServiceRegistrationStatus.CANCELLED]: 'default',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status: ServiceRegistrationStatus, t: any) => {
  const labels: Record<ServiceRegistrationStatus, string> = {
    [ServiceRegistrationStatus.PENDING_CONFIRMATION]: t('pendingConfirmation'),
    [ServiceRegistrationStatus.CONFIRMED]: t('confirmed'),
    [ServiceRegistrationStatus.REJECTED]: t('rejected'),
    [ServiceRegistrationStatus.IN_PROGRESS]: t('inProgress'),
    [ServiceRegistrationStatus.COMPLETED]: t('completed'),
    [ServiceRegistrationStatus.CANCELLED]: t('cancelled'),
  };
  return labels[status] || status;
};

export default function ServiceStatusChip({ 
  status, 
  size = 'small', 
  variant = 'outlined' 
}: ServiceStatusChipProps) {
  const t = useTranslations('services');
  
  return (
    <Chip
      label={getStatusLabel(status, t)}
      color={getStatusColor(status)}
      variant={variant}
      size={size}
    />
  );
}

'use client';

import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { ServiceRegistrationStatus } from '@/types/service.types';
import { useTranslations } from 'next-intl';

interface ServiceStatusChipProps {
  status: ServiceRegistrationStatus | number;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
}

type TranslationFunction = (key: string) => string;

export const getStatusColor = (status: ServiceRegistrationStatus | number) => {
  if (typeof status === 'number') {
    const colors: Record<number, ChipProps['color']> = {
      1: 'warning',
      2: 'info',
      3: 'primary',
      4: 'success',
      5: 'default',
      6: 'error',
    };

    return colors[status] || 'default';
  }

  const colors: Record<ServiceRegistrationStatus, ChipProps['color']> = {
    [ServiceRegistrationStatus.PENDING_CONFIRMATION]: 'warning',
    [ServiceRegistrationStatus.CONFIRMED]: 'info',
    [ServiceRegistrationStatus.REJECTED]: 'error',
    [ServiceRegistrationStatus.IN_PROGRESS]: 'primary',
    [ServiceRegistrationStatus.COMPLETED]: 'success',
    [ServiceRegistrationStatus.CANCELLED]: 'default',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status: ServiceRegistrationStatus | number, t: TranslationFunction) => {
  if (typeof status === 'number') {
    const labels: Record<number, string> = {
      1: t('pendingApproval'),
      2: t('awaitPayment'),
      3: t('active'),
      4: t('completed'),
      5: t('cancelled'),
      6: t('rejected'),
    };

    return labels[status] || String(status);
  }

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

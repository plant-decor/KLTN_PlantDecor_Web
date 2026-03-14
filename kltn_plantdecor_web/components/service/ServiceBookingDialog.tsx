'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { CareServicePackage, ServiceType, DifficultyLevel } from '@/types/service.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface ServiceBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceBookingData) => void;
}

export interface ServiceBookingData {
  servicePackageId: number;
  nurseryId: number;
  address: string;
  phone: string;
  serviceDate: string;
  note: string;
}

// Mock data for service packages
const MOCK_SERVICE_PACKAGES: CareServicePackage[] = [
  {
    id: 1,
    name: 'Basic Plant Care',
    description: 'Essential plant care including watering, pruning, and fertilizing',
    features: ['Watering', 'Pruning', 'Fertilizing', 'Pest check'],
    serviceType: ServiceType.ONETIME,
    durationDays: 1,
    difficultyLevel: DifficultyLevel.EASY,
    areaLimit: 50,
    unitPrice: 200000,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Premium Garden Care',
    description: 'Comprehensive garden maintenance with expert consultation',
    features: ['Full garden maintenance', 'Soil testing', 'Disease treatment', 'Expert advice'],
    serviceType: ServiceType.PERIODIC,
    frequency: 'Weekly',
    durationDays: 30,
    difficultyLevel: DifficultyLevel.MEDIUM,
    areaLimit: 100,
    unitPrice: 800000,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Plant Health Diagnosis',
    description: 'Professional diagnosis and treatment plan for sick plants',
    features: ['Health assessment', 'Treatment plan', 'Medicine application', 'Follow-up care'],
    serviceType: ServiceType.ONETIME,
    durationDays: 1,
    difficultyLevel: DifficultyLevel.HARD,
    areaLimit: 20,
    unitPrice: 500000,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// Mock nurseries/stores
const MOCK_NURSERIES = [
  { id: 1, name: 'Green Garden Nursery - District 1', address: '123 Nguyen Hue, District 1, HCM' },
  { id: 2, name: 'Tropical Plants Center - District 3', address: '456 Le Van Sy, District 3, HCM' },
  { id: 3, name: 'Urban Garden Store - District 7', address: '789 Nguyen Van Linh, District 7, HCM' },
  { id: 4, name: 'Plant Paradise - Thu Duc City', address: '321 Vo Van Ngan, Thu Duc, HCM' },
];

export default function ServiceBookingDialog({ open, onClose, onSubmit }: ServiceBookingDialogProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<ServiceBookingData>({
    servicePackageId: 0,
    nurseryId: 0,
    address: '',
    phone: '',
    serviceDate: '',
    note: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ServiceBookingData, string>>>({});

  const handleChange = (field: keyof ServiceBookingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceBookingData, string>> = {};

    if (!formData.servicePackageId) {
      newErrors.servicePackageId = 'Please select a service package';
    }
    if (!formData.nurseryId) {
      newErrors.nurseryId = 'Please select a nursery';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Service date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      servicePackageId: 0,
      nurseryId: 0,
      address: '',
      phone: '',
      serviceDate: '',
      note: '',
    });
    setErrors({});
    onClose();
  };

  const selectedPackage = MOCK_SERVICE_PACKAGES.find((pkg) => pkg.id === formData.servicePackageId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {t('bookNewService')}
      </DialogTitle>
      <DialogContent sx={{ pt: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 , pt: 2}}>
          {/* Service Package Selection */}
          <FormControl fullWidth error={!!errors.servicePackageId}>
            <InputLabel>{t('selectServicePackage')}</InputLabel>
            <Select
              value={formData.servicePackageId}
              onChange={(e) => handleChange('servicePackageId', e.target.value)}
              label={t('selectServicePackage')}
            >
              <MenuItem value={0} disabled>
                <em>{t('selectServicePackage')}</em>
              </MenuItem>
              {MOCK_SERVICE_PACKAGES.map((pkg) => (
                <MenuItem key={pkg.id} value={pkg.id}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {pkg.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pkg.description} - {pkg.unitPrice.toLocaleString('vi-VN')} VND
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.servicePackageId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.servicePackageId}
              </Typography>
            )}
          </FormControl>

          {/* Display selected package details */}
          {selectedPackage && (
            <Alert severity="info">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                {selectedPackage.name}
              </Typography>
              <Typography variant="caption" display="block">
                Type: {selectedPackage.serviceType} | Difficulty: {selectedPackage.difficultyLevel}
              </Typography>
              <Typography variant="caption" display="block">
                Features: {selectedPackage.features.join(', ')}
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                Price: {selectedPackage.unitPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Typography>
            </Alert>
          )}

          {/* Nursery Selection */}
          <FormControl fullWidth error={!!errors.nurseryId}>
            <InputLabel>{t('selectNursery')}</InputLabel>
            <Select
              value={formData.nurseryId}
              onChange={(e) => handleChange('nurseryId', e.target.value)}
              label={t('selectNursery')}
            >
              <MenuItem value={0} disabled>
                <em>{t('selectNursery')}</em>
              </MenuItem>
              {MOCK_NURSERIES.map((nursery) => (
                <MenuItem key={nursery.id} value={nursery.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {nursery.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {nursery.address}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.nurseryId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.nurseryId}
              </Typography>
            )}
          </FormControl>

          {/* Address */}
          <TextField
            fullWidth
            label={t('address')}
            placeholder={t('enterAddress')}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            multiline
            rows={2}
          />

          {/* Phone */}
          <TextField
            fullWidth
            label={t('phone')}
            placeholder={t('enterPhone')}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
          />

          {/* Service Date */}
          <TextField
            fullWidth
            label={t('serviceDate')}
            type="date"
            value={formData.serviceDate}
            onChange={(e) => handleChange('serviceDate', e.target.value)}
            error={!!errors.serviceDate}
            helperText={errors.serviceDate}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0], // Today or later
            }}
          />

          {/* Notes */}
          <TextField
            fullWidth
            label={t('notes')}
            placeholder={t('enterNotes')}
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" className='bg-error! font-semibold!' sx={{...hoverLiftStyle}}>
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" className='bg-primary! font-semibold!' sx={{ ...hoverLiftStyle }}>
          {t('submitRequest')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import {
  getDayOfWeekEnums,
  getNearbyNurseries,
  getPublicCareServicePackages,
} from '@/lib/api/careServiceService';
import type { CareServicePackage, NearbyNursery } from '@/types/care-service.types';

interface ServiceBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceBookingData) => void;
}

export interface ServiceBookingData {
  nurseryCareServiceId: number;
  address: string;
  phone: string;
  serviceDate: string;
  note: string;
  scheduleDaysOfWeek: number[];
  preferredShiftId: number;
  latitude?: number;
  longitude?: number;
}

const SERVICE_TYPE_ONETIME = 1;

export default function ServiceBookingDialog({ open, onClose, onSubmit }: ServiceBookingDialogProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const [packages, setPackages] = useState<CareServicePackage[]>([]);
  const [dayOfWeeks, setDayOfWeeks] = useState<Array<{ value: number; name: string }>>([]);
  const [nearbyNurseries, setNearbyNurseries] = useState<NearbyNursery[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState(0);

  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  const [formData, setFormData] = useState<ServiceBookingData>({
    nurseryCareServiceId: 0,
    address: '',
    phone: '',
    serviceDate: '',
    note: '',
    scheduleDaysOfWeek: [],
    preferredShiftId: 1,
    latitude: undefined,
    longitude: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ServiceBookingData, string>>>({});

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const serviceOptions = useMemo(() => {
    if (!selectedPackageId) {
      return [];
    }

    return nearbyNurseries.flatMap((nursery) =>
      nursery.availableServices
        .filter((service) => service.careServicePackage.id === selectedPackageId)
        .map((service) => ({
          nurseryName: nursery.name,
          nurseryAddress: nursery.address,
          distanceKm: nursery.distanceKm,
          nurseryCareServiceId: service.id,
          price: service.careServicePackage.unitPrice,
        }))
    );
  }, [nearbyNurseries, selectedPackageId]);

  const hasLatLng = typeof formData.latitude === 'number' && typeof formData.longitude === 'number';

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingPackages(true);
        const [packageData, dayOfWeekData] = await Promise.all([
          getPublicCareServicePackages(false),
          getDayOfWeekEnums(false),
        ]);
        setPackages(packageData.filter((item) => item.isActive));
        setDayOfWeeks(dayOfWeekData);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('loadPackagesFailed');
        toast.error(message);
      } finally {
        setLoadingPackages(false);
      }
    };

    void loadData();
  }, [open, t]);

  const handleChange = (field: keyof ServiceBookingData, value: ServiceBookingData[keyof ServiceBookingData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSearchNearbyNurseries = async () => {
    if (!selectedPackageId) {
        toast.error(t('packageRequiredBeforeSearch'));
      return;
    }

    try {
      setLoadingNearby(true);
      const radiusKm = hasLatLng ? 10 : 9999999;
      const nurseries = await getNearbyNurseries(
        {
          packageId: selectedPackageId,
          radiusKm,
          lat: formData.latitude,
          lng: formData.longitude,
        },
        false
      );

      setNearbyNurseries(nurseries);

      if (nurseries.length === 0) {
          toast.info(t('noMatchingNursery'));
      }
    } catch (error) {
        const message = error instanceof Error ? error.message : t('searchNearbyFailed');
      toast.error(message);
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('locationUnsupported'));
      return;
    }

    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setUsingCurrentLocation(false);
        toast.success(t('locationUpdated'));
      },
      () => {
        setUsingCurrentLocation(false);
        toast.warning(t('locationFailedGlobalFallback'));
      }
    );
  };

  const handleSelectDay = (dayValue: number, checked: boolean) => {
    if (checked) {
      if (selectedPackage?.serviceType === SERVICE_TYPE_ONETIME) {
        handleChange('scheduleDaysOfWeek', [dayValue]);
        return;
      }

      const nextValues = Array.from(new Set([...formData.scheduleDaysOfWeek, dayValue]));
      handleChange('scheduleDaysOfWeek', nextValues);
      return;
    }

    const nextValues = formData.scheduleDaysOfWeek.filter((day) => day !== dayValue);
    handleChange('scheduleDaysOfWeek', nextValues);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceBookingData, string>> = {};

    if (!formData.nurseryCareServiceId) {
        newErrors.nurseryCareServiceId = t('providerRequired');
    }
    if (!formData.address.trim()) {
        newErrors.address = t('addressRequired');
    }
    if (!formData.phone.trim()) {
        newErrors.phone = t('phoneRequired');
    } else if (!/^[0-9+\s-()]+$/.test(formData.phone)) {
        newErrors.phone = t('phoneInvalid');
    }
    if (!formData.serviceDate) {
        newErrors.serviceDate = t('serviceDateRequired');
    }
    if (formData.scheduleDaysOfWeek.length === 0) {
        newErrors.scheduleDaysOfWeek = t('scheduleRequired');
    }
    if (selectedPackage?.serviceType === SERVICE_TYPE_ONETIME && formData.scheduleDaysOfWeek.length !== 1) {
        newErrors.scheduleDaysOfWeek = t('oneTimeScheduleRule');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nurseryCareServiceId: 0,
      address: '',
      phone: '',
      serviceDate: '',
      note: '',
      scheduleDaysOfWeek: [],
      preferredShiftId: 1,
      latitude: undefined,
      longitude: undefined,
    });
    setSelectedPackageId(0);
    setNearbyNurseries([]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('bookNewService')}</DialogTitle>
      <DialogContent sx={{ pt: 5 }}>
        {loadingPackages ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('selectServicePackage')}</InputLabel>
              <Select
                value={selectedPackageId}
                onChange={(e) => {
                  setSelectedPackageId(Number(e.target.value));
                  setNearbyNurseries([]);
                  handleChange('nurseryCareServiceId', 0);
                  handleChange('scheduleDaysOfWeek', []);
                }}
                label={t('selectServicePackage')}
              >
                <MenuItem value={0} disabled>
                  <em>{t('selectServicePackage')}</em>
                </MenuItem>
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {pkg.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'normal' }}>
                        {pkg.description} - {pkg.unitPrice.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedPackage && (
              <Alert severity="info">
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {selectedPackage.name}
                </Typography>
                <Typography variant="caption" display="block">
                  {t('serviceTypeLabel')}: {selectedPackage.serviceType === 1 ? t('oneTime') : t('periodic')} | {t('totalSessions')}: {selectedPackage.totalSessions ?? '-'}
                </Typography>
                <Typography variant="caption" display="block">
                  {t('serviceTasks')}: {selectedPackage.features}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                  {t('price')}: {selectedPackage.unitPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Alert>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Button variant="outlined" onClick={handleUseCurrentLocation} disabled={usingCurrentLocation} sx={{ ...hoverLiftStyle }}>
                {usingCurrentLocation ? t('gettingLocation') : t('useCurrentLocation')}
              </Button>
              <Button
                variant="contained"
                onClick={() => void handleSearchNearbyNurseries()}
                disabled={!selectedPackageId || loadingNearby}
                sx={{ ...hoverLiftStyle }}
                className="bg-primary!"
              >
                {loadingNearby ? t('searchingNurseries') : t('searchMatchingNurseries')}
              </Button>
            </Stack>

            {hasLatLng ? (
              <Alert severity="success">{t('radiusWithLocation')}</Alert>
            ) : (
              <Alert severity="warning">{t('radiusWithoutLocation')}</Alert>
            )}

            <FormControl fullWidth error={!!errors.nurseryCareServiceId}>
              <InputLabel>{t('providerNursery')}</InputLabel>
              <Select
                value={formData.nurseryCareServiceId}
                onChange={(e) => handleChange('nurseryCareServiceId', Number(e.target.value))}
                label={t('providerNursery')}
              >
                <MenuItem value={0} disabled>
                  <em>{t('selectProviderNursery')}</em>
                </MenuItem>
                {serviceOptions.map((option) => (
                  <MenuItem key={option.nurseryCareServiceId} value={option.nurseryCareServiceId}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.nurseryName} - {option.price.toLocaleString('vi-VN')} VND
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'normal' }}>
                        {option.nurseryAddress} | Cách {option.distanceKm.toFixed(2)} km
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.nurseryCareServiceId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.nurseryCareServiceId}
                </Typography>
              )}
            </FormControl>

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

            <TextField
              fullWidth
              label={t('phone')}
              placeholder={t('enterPhone')}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
            />

            <TextField
              fullWidth
              label={t('serviceDate')}
              type="date"
              value={formData.serviceDate}
              onChange={(e) => handleChange('serviceDate', e.target.value)}
              error={!!errors.serviceDate}
              helperText={errors.serviceDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />

            <FormControl component="fieldset" error={!!errors.scheduleDaysOfWeek}>
              <FormLabel component="legend">{t('selectScheduleDays')}</FormLabel>
              <FormGroup row>
                {dayOfWeeks.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={formData.scheduleDaysOfWeek.includes(day.value)}
                        onChange={(_, checked) => handleSelectDay(day.value, checked)}
                      />
                    }
                    label={day.name}
                  />
                ))}
              </FormGroup>
              {errors.scheduleDaysOfWeek && (
                <Typography variant="caption" color="error">
                  {errors.scheduleDaysOfWeek}
                </Typography>
              )}
              {selectedPackage?.serviceType === SERVICE_TYPE_ONETIME && (
                <Typography variant="caption" color="text.secondary">
                  {t('oneTimeScheduleHint')}
                </Typography>
              )}
            </FormControl>

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
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" className="bg-error! font-semibold!" sx={{ ...hoverLiftStyle }}>
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" className="bg-primary! font-semibold!" sx={{ ...hoverLiftStyle }}>
          {t('submitRequest')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

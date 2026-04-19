'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';
import {
  getDayOfWeekEnums,
  getNearbyNurseries,
  getPublicCareServicePackages,
  getSystemEnumValues,
} from '@/lib/api/careServiceService';
import { getUserProfile } from '@/lib/api/userProfileService';
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
const DAY_OF_WEEK_SUNDAY = 0;

const getLocalDateInputValue = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ServiceBookingDialog({ open, onClose, onSubmit }: ServiceBookingDialogProps) {
  const t = useTranslations('services');
  const tError = useTranslations('profile');
  const tCommon = useTranslations('common');

  const [packages, setPackages] = useState<CareServicePackage[]>([]);
  const [serviceTypeEnums, setServiceTypeEnums] = useState<Array<{ value: number; name: string }>>([]);
  const [dayOfWeeks, setDayOfWeeks] = useState<Array<{ value: number; name: string }>>([]);
  const [nearbyNurseries, setNearbyNurseries] = useState<NearbyNursery[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState(0);

  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const lastAutoSearchKeyRef = useRef('');

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

  const serviceTypeOneTimeValue = useMemo(() => {
    const matched = serviceTypeEnums.find((item) => item.name.toLowerCase() === 'onetime');
    return matched?.value ?? SERVICE_TYPE_ONETIME;
  }, [serviceTypeEnums]);

  const serviceTypePeriodicValue = useMemo(() => {
    const matched = serviceTypeEnums.find((item) => item.name.toLowerCase() === 'periodic');
    return matched?.value ?? 2;
  }, [serviceTypeEnums]);

  const isPeriodicPackage = selectedPackage?.serviceType === serviceTypePeriodicValue;

  const allowedDayOfWeeks = useMemo(() => {
    if (!isPeriodicPackage) {
      return dayOfWeeks;
    }

    return dayOfWeeks.filter((day) => day.value !== DAY_OF_WEEK_SUNDAY);
  }, [dayOfWeeks, isPeriodicPackage]);

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
        const [packageData, dayOfWeekData, serviceTypeData] = await Promise.all([
          getPublicCareServicePackages(false),
          getDayOfWeekEnums(false),
          getSystemEnumValues('CareServiceType', false),
        ]);
        setPackages(packageData.filter((item) => item.isActive));
        setDayOfWeeks(dayOfWeekData);
        setServiceTypeEnums(serviceTypeData);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('loadPackagesFailed');
        toast.error(message);
      } finally {
        setLoadingPackages(false);
      }
    };

    void loadData();
  }, [open, t]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const initializeContactInfo = async () => {
      try {
        const response = await getUserProfile(false);
        const rawProfile = response?.payload ?? response?.data;
        const profile =
          rawProfile && typeof rawProfile === 'object' && 'payload' in rawProfile
            ? (rawProfile as { payload?: typeof rawProfile }).payload
            : rawProfile;

        if (!isMounted || !profile) {
          return;
        }

        const profilePhone =
          profile.phoneNumber ??
          (profile as typeof profile & { phone?: string }).phone ??
          '';
        const profileAddress = profile.address ?? '';

        setFormData((prev) => ({
          ...prev,
          phone: prev.phone || profilePhone,
          address: prev.address || profileAddress,
        }));
      } catch (error) {
        console.error('Failed to initialize booking contact info from user profile:', error);
      }
    };

    void initializeContactInfo();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!selectedPackage || selectedPackage.serviceType !== serviceTypePeriodicValue) {
      return;
    }

    const filteredDays = formData.scheduleDaysOfWeek.filter((day) => day !== DAY_OF_WEEK_SUNDAY);
    if (filteredDays.length !== formData.scheduleDaysOfWeek.length) {
      setFormData((prev) => ({ ...prev, scheduleDaysOfWeek: filteredDays }));
      if (errors.scheduleDaysOfWeek) {
        setErrors((prev) => ({ ...prev, scheduleDaysOfWeek: '' }));
      }
    }
  }, [errors.scheduleDaysOfWeek, formData.scheduleDaysOfWeek, selectedPackage, serviceTypePeriodicValue]);

  const handleChange = (field: keyof ServiceBookingData, value: ServiceBookingData[keyof ServiceBookingData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSearchNearbyNurseries = useCallback(async (options?: { packageId?: number; latitude?: number; longitude?: number }) => {
    const packageId = options?.packageId ?? selectedPackageId;
    const latitude = options?.latitude ?? formData.latitude;
    const longitude = options?.longitude ?? formData.longitude;

    if (!packageId) {
        toast.error(t('packageRequiredBeforeSearch'));
      return;
    }

    try {
      setLoadingNearby(true);
      const hasSearchLocation = typeof latitude === 'number' && typeof longitude === 'number';
      const radiusKm = hasSearchLocation ? 10 : 9999999;
      const nurseries = await getNearbyNurseries(
        {
          packageId,
          radiusKm,
          lat: latitude,
          lng: longitude,
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
  }, [formData.latitude, formData.longitude, selectedPackageId, t]);

  useEffect(() => {
    if (!open || !selectedPackageId || !hasLatLng) {
      return;
    }

    const searchKey = `${selectedPackageId}-${formData.latitude}-${formData.longitude}`;
    if (lastAutoSearchKeyRef.current === searchKey) {
      return;
    }

    lastAutoSearchKeyRef.current = searchKey;
    void handleSearchNearbyNurseries({
      packageId: selectedPackageId,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });
  }, [formData.latitude, formData.longitude, handleSearchNearbyNurseries, hasLatLng, open, selectedPackageId]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('locationUnsupported'));
      return;
    }

    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        setUsingCurrentLocation(false);
        toast.success(t('locationUpdated'));
        if (selectedPackageId) {
          void handleSearchNearbyNurseries({
            packageId: selectedPackageId,
            latitude,
            longitude,
          });
        }
      },
      () => {
        setUsingCurrentLocation(false);
        toast.warning(t('locationFailedGlobalFallback'));
      }
    );
  };

  const handleSelectDay = (dayValue: number, checked: boolean) => {
    if (isPeriodicPackage && dayValue === DAY_OF_WEEK_SUNDAY) {
      return;
    }

    if (checked) {
      if (selectedPackage?.serviceType === serviceTypeOneTimeValue) {
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
    const today = getLocalDateInputValue();

    if (!formData.nurseryCareServiceId) {
        newErrors.nurseryCareServiceId = t('providerRequired');
    }
    if (!formData.address.trim()) {
        newErrors.address = t('addressRequired');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = tError('phoneRequired');
    } else if (!isValidPhoneNumber10Digits(formData.phone)) {
      newErrors.phone = tError('phoneNumberInvalid');
    }
    if (!formData.serviceDate) {
        newErrors.serviceDate = t('serviceDateRequired');
    } else if (formData.serviceDate < today) {
      newErrors.serviceDate = t('serviceDatePast');
    }
    if (selectedPackage?.serviceType === serviceTypePeriodicValue) {
      if (formData.scheduleDaysOfWeek.length === 0) {
        newErrors.scheduleDaysOfWeek = t('scheduleRequired');
      }
      if (selectedPackage.visitPerWeek > 6) {
        newErrors.scheduleDaysOfWeek = t('periodicVisitPerWeekInvalid');
      } else if (formData.scheduleDaysOfWeek.includes(DAY_OF_WEEK_SUNDAY)) {
        newErrors.scheduleDaysOfWeek = t('periodicSundayNotAllowed');
      } else if (formData.scheduleDaysOfWeek.length !== selectedPackage.visitPerWeek) {
        newErrors.scheduleDaysOfWeek = t('periodicScheduleRule', { count: selectedPackage.visitPerWeek });
      }
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
    lastAutoSearchKeyRef.current = '';
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
                  {t('visitFrequency')}: {selectedPackage.visitPerWeek > 0 ? `${selectedPackage.visitPerWeek} ${t('timesPerWeek')}` : t('visitFrequencyNotDefined')}
                </Typography>
                <Typography variant="caption" display="block">
                    {t('duration')}: {selectedPackage.durationDays > 0 ? `${selectedPackage.durationDays} ${t('days')}` : t('durationNotDefined')}
                </Typography>
                <Typography variant="caption" display="block">
                  {t('serviceTasks')}: {selectedPackage.features}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                  {t('price')}: {selectedPackage.unitPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Alert>
            )}

            <Button variant="outlined" onClick={handleUseCurrentLocation} disabled={usingCurrentLocation} sx={{ ...hoverLiftStyle }}>
              {usingCurrentLocation ? t('gettingLocation') : t('useCurrentLocation')}
            </Button>

            {selectedPackageId && loadingNearby ? (
              <Alert severity="info">{t('searchingNurseries')}</Alert>
            ) : null}

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
              type='number'
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
              inputProps={{ min: getLocalDateInputValue() }}
            />

            {isPeriodicPackage && (
              <FormControl component="fieldset" error={!!errors.scheduleDaysOfWeek}>
                <FormLabel component="legend">{t('selectScheduleDays')}</FormLabel>
                <FormGroup row>
                  {allowedDayOfWeeks.map((day) => (
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
                <Typography variant="caption" color="text.secondary">
                  {t('periodicScheduleHint', { count: selectedPackage?.visitPerWeek ?? 0 })}
                </Typography>
              </FormControl>
            )}

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
        <Button onClick={handleClose} color="inherit" className="bg-error! font-semibold! text-white!" sx={{ ...hoverLiftStyle }}>
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" className="bg-primary! font-semibold!" sx={{ ...hoverLiftStyle }}>
          {t('submitRequest')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

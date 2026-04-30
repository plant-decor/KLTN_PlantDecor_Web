'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
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
import { CustomLoading } from '@/components/CustomLoading';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';
import {
  getDayOfWeekEnums,
  getPublicCareServicePackages,
  getPublicNurseryCareServicesByPackage,
  getPublicShifts,
  getSystemEnumValues,
} from '@/lib/api/careServiceService';
import { getUserProfile } from '@/lib/api/userProfileService';
import { getAddressFromCoordinates, searchAddressSuggestions, type AddressSuggestion } from '@/lib/utils/geocoding';
import type { CareServicePackage, NurseryCareService, PublicShift } from '@/types/care-service.types';

interface ServiceBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceBookingData) => void;
  initialPackageId?: number | null;
}

export interface ServiceBookingData {
  careServicePackageId: number;
  preferredNurseryId?: number;
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

export default function ServiceBookingDialog({ open, onClose, onSubmit, initialPackageId }: ServiceBookingDialogProps) {
  const t = useTranslations('services');
  const tError = useTranslations('profile');
  const tCommon = useTranslations('common');

  const [packages, setPackages] = useState<CareServicePackage[]>([]);
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [serviceTypeEnums, setServiceTypeEnums] = useState<Array<{ value: number; name: string }>>([]);
  const [dayOfWeeks, setDayOfWeeks] = useState<Array<{ value: number; name: string }>>([]);
  const [packageNurseryServices, setPackageNurseryServices] = useState<NurseryCareService[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingAddressSuggestions, setLoadingAddressSuggestions] = useState(false);
  const [addressInputValue, setAddressInputValue] = useState('');
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState(0);

  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingNurseryServices, setLoadingNurseryServices] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  const [formData, setFormData] = useState<ServiceBookingData>({
    careServicePackageId: 0,
    preferredNurseryId: undefined,
    address: '',
    phone: '',
    serviceDate: '',
    note: '',
    scheduleDaysOfWeek: [],
    preferredShiftId: 0,
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

  const nurseryOptions = useMemo(() => {
    if (!selectedPackageId) {
      return [];
    }

    return packageNurseryServices
      .filter((service) => service.careServicePackage.id === selectedPackageId && service.isActive)
      .map((service) => ({
        nurseryId: service.nurseryId,
        nurseryName: service.nurseryName,
        price: service.careServicePackage.unitPrice,
      }));
  }, [packageNurseryServices, selectedPackageId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingPackages(true);
        const [packageData, dayOfWeekData, serviceTypeData, shiftData] = await Promise.all([
          getPublicCareServicePackages(false),
          getDayOfWeekEnums(false),
          getSystemEnumValues('CareServiceType', false),
          getPublicShifts(false),
        ]);
        setPackages(packageData.filter((item) => item.isActive));
        setDayOfWeeks(dayOfWeekData);
        setServiceTypeEnums(serviceTypeData);
        setShifts(shiftData);
        setFormData((prev) => ({
          ...prev,
          preferredShiftId: prev.preferredShiftId || shiftData[0]?.id || 0,
        }));
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

    if (!initialPackageId) {
      return;
    }

    if (!packages.length) {
      return;
    }

    const matched = packages.find((pkg) => pkg.id === initialPackageId);
    if (!matched) {
      return;
    }

    setSelectedPackageId((prev) => (prev === initialPackageId ? prev : initialPackageId));
    setFormData((prev) =>
      prev.careServicePackageId === initialPackageId
        ? prev
        : {
            ...prev,
            careServicePackageId: initialPackageId,
            preferredNurseryId: undefined,
            scheduleDaysOfWeek: [],
          },
    );
    setErrors((prev) => {
      if (!prev.careServicePackageId) return prev;
      const next = { ...prev };
      delete next.careServicePackageId;
      return next;
    });
  }, [open, initialPackageId, packages]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = addressInputValue.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setLoadingAddressSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingAddressSuggestions(true);
      try {
        const suggestions = await searchAddressSuggestions(query);
        setAddressSuggestions(suggestions);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setLoadingAddressSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [addressInputValue, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!selectedPackageId) {
      setPackageNurseryServices([]);
      return;
    }

    let isMounted = true;

    const loadNurseryServices = async () => {
      try {
        setLoadingNurseryServices(true);
        const services = await getPublicNurseryCareServicesByPackage(selectedPackageId, false);
        if (!isMounted) {
          return;
        }

        const activeServices = services.filter((item) => item.isActive);
        setPackageNurseryServices(activeServices);

        if (activeServices.length === 0) {
          toast.info(t('noMatchingNursery'));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : t('searchNearbyFailed');
        toast.error(message);
      } finally {
        if (isMounted) {
          setLoadingNurseryServices(false);
        }
      }
    };

    void loadNurseryServices();

    return () => {
      isMounted = false;
    };
  }, [open, selectedPackageId, t]);

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
        setAddressInputValue((prev) => prev || profileAddress);
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
      setErrors((prev) => ({ ...prev, scheduleDaysOfWeek: '' }));
    }
  }, [errors.scheduleDaysOfWeek, formData.scheduleDaysOfWeek, selectedPackage, serviceTypePeriodicValue]);

  const handleChange = (field: keyof ServiceBookingData, value: ServiceBookingData[keyof ServiceBookingData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressInputChange = (value: string) => {
    setAddressInputValue(value);
    setSelectedAddressSuggestion(null);
    setFormData((prev) => ({
      ...prev,
      address: value,
      latitude: undefined,
      longitude: undefined,
    }));

    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: '' }));
    }
  };

  const handleAddressSuggestionChange = (value: AddressSuggestion | string | null) => {
    if (!value) {
      handleAddressInputChange('');
      setAddressSuggestions([]);
      return;
    }

    if (typeof value === 'object') {
      setSelectedAddressSuggestion(value);
      setAddressInputValue(value.display_name);
      setAddressSuggestions([]);
      setFormData((prev) => ({
        ...prev,
        address: value.display_name,
        latitude: value.latitude,
        longitude: value.longitude,
      }));
      return;
    }

    handleAddressInputChange(value);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('locationUnsupported'));
      return;
    }

    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const detectedAddress = await getAddressFromCoordinates(latitude, longitude);

        setFormData((prev) => ({
          ...prev,
          address: detectedAddress || prev.address,
          latitude,
          longitude,
        }));

        if (detectedAddress) {
          setAddressInputValue(detectedAddress);
          setSelectedAddressSuggestion(null);
          setAddressSuggestions([]);
          setErrors((prev) => ({ ...prev, address: '' }));
        }

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

    if (!selectedPackageId) {
      newErrors.careServicePackageId = t('packageRequiredBeforeSearch');
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
    if (!formData.preferredShiftId) {
      newErrors.preferredShiftId = t('shift');
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

    const fallbackSuggestion = !selectedAddressSuggestion && addressSuggestions.length > 0 ? addressSuggestions[0] : null;

    onSubmit({
      ...formData,
      careServicePackageId: selectedPackageId,
      preferredNurseryId: formData.preferredNurseryId,
      latitude: fallbackSuggestion?.latitude ?? formData.latitude,
      longitude: fallbackSuggestion?.longitude ?? formData.longitude,
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      careServicePackageId: 0,
      preferredNurseryId: undefined,
      address: '',
      phone: '',
      serviceDate: '',
      note: '',
      scheduleDaysOfWeek: [],
      preferredShiftId: shifts[0]?.id || 0,
      latitude: undefined,
      longitude: undefined,
    });
    setAddressInputValue('');
    setAddressSuggestions([]);
    setSelectedAddressSuggestion(null);
    setSelectedPackageId(0);
    setPackageNurseryServices([]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('bookNewService')}</DialogTitle>
      <DialogContent sx={{ pt: 5 }}>
        {loadingPackages ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CustomLoading />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('selectServicePackage')}</InputLabel>
              <Select
                value={selectedPackageId}
                onChange={(e) => {
                  const packageId = Number(e.target.value);
                  setSelectedPackageId(packageId);
                  setPackageNurseryServices([]);
                  handleChange('careServicePackageId', packageId);
                  handleChange('preferredNurseryId', undefined);
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

            {selectedPackageId && loadingNurseryServices ? (
              <Alert severity="info">{t('searchingNurseries')}</Alert>
            ) : null}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
              <Autocomplete
                freeSolo
                options={addressSuggestions}
                filterOptions={(options) => options}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.display_name || '')}
                inputValue={addressInputValue}
                onInputChange={(_, value) => handleAddressInputChange(value)}
                onChange={(_, value) => handleAddressSuggestionChange(value)}
                loading={loadingAddressSuggestions}
                sx={{ flex: 1, width: '100%' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label={t('address')}
                    placeholder={t('enterAddress')}
                    error={!!errors.address}
                    helperText={errors.address}
                    multiline
                    rows={2}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingAddressSuggestions ? <CustomLoading size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Button
                variant="outlined"
                onClick={handleUseCurrentLocation}
                disabled={usingCurrentLocation}
                sx={{ ...hoverLiftStyle, minHeight: 56, width: { xs: '100%', md: 'auto' } }}
              >
                {usingCurrentLocation ? t('gettingLocation') : t('useCurrentLocation')}
              </Button>
            </Box>

            <FormControl fullWidth error={!!errors.preferredShiftId}>
              <InputLabel>{t('shift')}</InputLabel>
              <Select
                value={formData.preferredShiftId}
                onChange={(e) => handleChange('preferredShiftId', Number(e.target.value))}
                label={t('shift')}
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.shiftName} ({shift.startTime} - {shift.endTime})
                  </MenuItem>
                ))}
              </Select>
              {errors.preferredShiftId ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.preferredShiftId}
                </Typography>
              ) : null}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('providerNursery')}</InputLabel>
              <Select
                value={formData.preferredNurseryId ?? 0}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  handleChange('preferredNurseryId', value === 0 ? undefined : value);
                }}
                label={t('providerNursery')}
              >
                <MenuItem value={0}>
                  <em>{t('selectProviderNursery')} (optional)</em>
                </MenuItem>
                {nurseryOptions.map((option) => (
                  <MenuItem key={option.nurseryId} value={option.nurseryId}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.nurseryName} - {option.price.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslations } from 'next-intl';
import {
  getUserProfile,
  updateUserAvatar,
  updateUserProfile,
} from '@/lib/api/userProfileService';
import {
  getMyManagerNursery,
  updateMyManagerNursery,
} from '@/lib/api/managerStoreCatalogService';
import type {
  UpdateUserProfileRequest,
  UserGender,
  UserProfile,
} from '@/types/auth.types';
import type {
  ManagerNursery,
  UpdateMyManagerNurseryRequest,
} from '@/types/manager-store-catalog.types';
import type { ResponseModel } from '@/types/api.types';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

type ManagerProfileFormState = {
  userName: string;
  phoneNumber: string;
  fullName: string;
  address: string;
  birthYear: string;
  gender: UserGender;
  latitude: string;
  longitude: string;
  receiveNotifications: boolean;
};

type NurseryFormState = {
  name: string;
  address: string;
  area: string;
  latitude: string;
  longitude: string;
  phone: string;
  isActive: boolean;
};

const GENDER_OPTIONS: UserGender[] = ['Unknown', 'Male', 'Female', 'Other'];

const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

const normalizeGender = (gender: unknown): UserGender => {
  if (typeof gender === 'number') {
    const byIndex: Record<number, UserGender> = {
      0: 'Unknown',
      1: 'Male',
      2: 'Female',
      3: 'Other',
    };

    return byIndex[gender] || 'Unknown';
  }

  if (typeof gender === 'string') {
    const normalized = gender.trim().toLowerCase();
    if (normalized === 'male') return 'Male';
    if (normalized === 'female') return 'Female';
    if (normalized === 'other') return 'Other';
  }

  return 'Unknown';
};

const toStringOrEmpty = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  return String(value);
};

const parseNullableNumber = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseNumberOrZero = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ReadonlyField = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => {
  const displayValue =
    value === null || value === undefined || String(value).trim() === '' ? '-' : String(value);

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1,
        backgroundColor: 'action.hover',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {displayValue}
      </Typography>
    </Box>
  );
};

export default function ManagerNurseryProfilePage() {
  const t = useTranslations('managerNurseryProfile');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nursery, setNursery] = useState<ManagerNursery | null>(null);

  const [profileForm, setProfileForm] = useState<ManagerProfileFormState>({
    userName: '',
    phoneNumber: '',
    fullName: '',
    address: '',
    birthYear: '',
    gender: 'Unknown',
    latitude: '',
    longitude: '',
    receiveNotifications: false,
  });

  const [nurseryForm, setNurseryForm] = useState<NurseryFormState>({
    name: '',
    address: '',
    area: '',
    latitude: '',
    longitude: '',
    phone: '',
    isActive: true,
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [nurseryLoading, setNurseryLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [nurserySaving, setNurserySaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [nurseryError, setNurseryError] = useState<string | null>(null);

  const applyUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setProfileForm({
      userName: profile.username ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      fullName: profile.fullName ?? '',
      address: profile.address ?? '',
      birthYear: toStringOrEmpty(profile.birthYear),
      gender: normalizeGender(profile.gender),
      latitude: toStringOrEmpty(profile.latitude),
      longitude: toStringOrEmpty(profile.longitude),
      receiveNotifications: Boolean(profile.receiveNotifications),
    });
  };

  const applyNursery = (nurseryData: ManagerNursery) => {
    setNursery(nurseryData);
    setNurseryForm({
      name: nurseryData.name ?? '',
      address: nurseryData.address ?? '',
      area: toStringOrEmpty(nurseryData.area),
      latitude: toStringOrEmpty(nurseryData.latitude),
      longitude: toStringOrEmpty(nurseryData.longitude),
      phone: nurseryData.phone ?? '',
      isActive: nurseryData.isActive,
    });
  };

  const fetchUserProfileData = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await getUserProfile(false);
      const payload = getPayload(response);

      if (!payload) {
        setUserProfile(null);
        return;
      }

      applyUserProfile(payload);
    } catch (error) {
      setUserProfile(null);
      setProfileError(getErrorMessage(error, t('errors.profileLoadFailed')));
    } finally {
      setProfileLoading(false);
    }
  }, [t]);

  const fetchNurseryData = useCallback(async () => {
    setNurseryLoading(true);
    setNurseryError(null);

    try {
      const response = await getMyManagerNursery(false);
      const payload = getPayload(response);

      if (!payload) {
        setNursery(null);
        setNurseryError(t('errors.nurseryLoadEmpty'));
        return;
      }

      applyNursery(payload);
    } catch (error) {
      setNursery(null);
      setNurseryError(getErrorMessage(error, t('errors.nurseryLoadFailed')));
    } finally {
      setNurseryLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.all([fetchUserProfileData(), fetchNurseryData()]);
  }, [fetchNurseryData, fetchUserProfileData]);

  const avatarFallback = useMemo(() => {
    const source =
      userProfile?.fullName?.trim() ||
      userProfile?.username?.trim() ||
      userProfile?.email?.trim() ||
      'U';
    return source.charAt(0).toUpperCase();
  }, [userProfile?.email, userProfile?.fullName, userProfile?.username]);

  const handleProfileInputChange = (
    field: keyof ManagerProfileFormState,
    value: string | boolean
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNurseryInputChange = (
    field: keyof NurseryFormState,
    value: string | boolean
  ) => {
    setNurseryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSave = async () => {
    const phoneNumber = profileForm.phoneNumber.trim();

    if (!isValidPhoneNumber10Digits(phoneNumber)) {
      setProfileError(t('phoneNumberInvalid'));
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    const request: UpdateUserProfileRequest = {
      userName: profileForm.userName.trim(),
      fullName: profileForm.fullName.trim(),
      phoneNumber,
      address: profileForm.address.trim(),
      birthYear: parseNumberOrZero(profileForm.birthYear),
      gender: profileForm.gender,
      latitude: parseNumberOrZero(profileForm.latitude),
      longitude: parseNumberOrZero(profileForm.longitude),
      receiveNotifications: profileForm.receiveNotifications,
    };

    try {
      const response = await updateUserProfile(request, false);
      const payload = getPayload(response);
      if (payload) {
        applyUserProfile(payload);
      }
      await fetchUserProfileData();
    } catch (error) {
      setProfileError(getErrorMessage(error, t('errors.profileSaveFailed')));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleNurserySave = async () => {
    setNurserySaving(true);
    setNurseryError(null);

    const request: UpdateMyManagerNurseryRequest = {
      name: nurseryForm.name.trim(),
      address: nurseryForm.address.trim(),
      area: parseNullableNumber(nurseryForm.area),
      latitude: parseNullableNumber(nurseryForm.latitude),
      longitude: parseNullableNumber(nurseryForm.longitude),
      phone: nurseryForm.phone.trim(),
      isActive: nurseryForm.isActive,
    };

    try {
      const response = await updateMyManagerNursery(request, false);
      const payload = getPayload(response);
      if (payload) {
        applyNursery(payload);
      }
      await fetchNurseryData();
    } catch (error) {
      setNurseryError(getErrorMessage(error, t('errors.nurserySaveFailed')));
    } finally {
      setNurserySaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const maxSize = 5 * 1024 * 1024;
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/heif'];

    if (!allowedFormats.includes(file.type)) {
      setProfileError(t('errors.avatarUnsupportedFormat'));
      return;
    }

    if (file.size > maxSize) {
      setProfileError(t('errors.avatarSizeExceeded'));
      return;
    }

    setAvatarUploading(true);
    setProfileError(null);

    try {
      await updateUserAvatar(file, false);
      await fetchUserProfileData();
    } catch (error) {
      setProfileError(getErrorMessage(error, t('errors.avatarUploadFailed')));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <Box sx={{ py: 3, minHeight: '100%' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', gap: 2, width: '100%', height: '100%' }}>
      {/* <Stack spacing={3}> */}
        <Card sx={{ boxShadow: 2, flexBasis: '50%', display: 'flex' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Typography variant="h6" fontWeight={700}>
                {t('managerSection.title')}
              </Typography>

              {profileError && <Alert severity="error">{profileError}</Alert>}

              {profileLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2">{t('loadingProfile')}</Typography>
                </Stack>
              ) : (
                <>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        src={userProfile?.avatarUrl}
                        alt={userProfile?.fullName || userProfile?.username || 'Manager avatar'}
                        sx={{ width: 120, height: 120, fontSize: 32, fontWeight: 700 }}
                      >
                        {avatarFallback}
                      </Avatar>
                      <Button
                        component="label"
                        variant="contained"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        disabled={avatarUploading}
                        sx={{ mt: 1, backgroundColor: 'var(--primary)', color: '#000000' ,...hoverLiftStyle }}
                      >
                        {avatarUploading ? t('managerSection.uploadingAvatar') : t('managerSection.changeAvatar')}
                        <input
                          hidden
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/heif"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleAvatarUpload(file);
                            }
                            event.target.value = '';
                          }}
                        />
                      </Button>
                    </Box>

                    <Box sx={{ flex: 1, width: '100%' }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        <ReadonlyField label={tAuth('email')} value={userProfile?.email} />
                        <ReadonlyField label={tAuth('phone')} value={userProfile?.phoneNumber} />
                        <ReadonlyField
                          label={t('managerSection.role')}
                          value={userProfile?.role ?? 'Manager'}
                        />
                        <ReadonlyField
                          label={t('managerSection.nurseryName')}
                          value={userProfile?.nurseryName}
                        />
                      </Box>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={t('managerSection.userName')}
                        value={profileForm.userName}
                        onChange={(event) => handleProfileInputChange('userName', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        type='number'
                        label={tAuth('phone')}
                        value={profileForm.phoneNumber}
                        onChange={(event) => handleProfileInputChange('phoneNumber', event.target.value)}
                        fullWidth
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={tAuth('fullName')}
                        value={profileForm.fullName}
                        onChange={(event) => handleProfileInputChange('fullName', event.target.value)}
                        fullWidth
                      />
                    </Stack>

                    <TextField
                      label={tAuth('address')}
                      value={profileForm.address}
                      onChange={(event) => handleProfileInputChange('address', event.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={t('managerSection.birthYear')}
                        type="number"
                        value={profileForm.birthYear}
                        onChange={(event) => handleProfileInputChange('birthYear', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label={t('managerSection.gender')}
                        value={profileForm.gender}
                        onChange={(event) =>
                          handleProfileInputChange('gender', event.target.value as UserGender)
                        }
                        select
                        fullWidth
                      >
                        {GENDER_OPTIONS.map((gender) => (
                          <MenuItem key={gender} value={gender}>
                            {t(`managerSection.genderOptions.${gender}`)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={t('managerSection.latitude')}
                        type="number"
                        value={profileForm.latitude}
                        onChange={(event) => handleProfileInputChange('latitude', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label={t('managerSection.longitude')}
                        type="number"
                        value={profileForm.longitude}
                        onChange={(event) => handleProfileInputChange('longitude', event.target.value)}
                        fullWidth
                      />
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={profileForm.receiveNotifications}
                          onChange={(event) =>
                            handleProfileInputChange('receiveNotifications', event.target.checked)
                          }
                        />
                      }
                      label={t('managerSection.receiveNotifications')}
                    />
                  </Stack>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      sx={{backgroundColor: 'var(--primary)', ...hoverLiftStyle}}
                    >
                      {profileSaving ? t('saving') : tCommon('save')}
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, flexBasis: '50%' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                {t('nurserySection.title')}
              </Typography>

              {nurseryError && <Alert severity="error">{nurseryError}</Alert>}

              {nurseryLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2">{t('loadingNursery')}</Typography>
                </Stack>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                      gap: 1.5,
                    }}
                  >
                    <ReadonlyField label={t('nurserySection.id')} value={nursery?.id} />
                    <ReadonlyField label={t('nurserySection.managerName')} value={nursery?.managerName} />
                    <ReadonlyField
                      label={t('nurserySection.createdAt')}
                      value={nursery?.createdAt ? new Date(nursery.createdAt).toLocaleString() : null}
                    />
                    <ReadonlyField label={t('nurserySection.totalPlants')} value={nursery?.totalPlants} />
                    <ReadonlyField
                      label={t('nurserySection.totalMaterials')}
                      value={nursery?.totalMaterials}
                    />
                  </Box>

                  <Divider sx={{ my: 1, pt:4 }} />

                  <Stack spacing={2}>
                    <TextField
                      label={t('nurserySection.name')}
                      value={nurseryForm.name}
                      onChange={(event) => handleNurseryInputChange('name', event.target.value)}
                      fullWidth
                    />

                    <TextField
                      label={tAuth('address')}
                      value={nurseryForm.address}
                      onChange={(event) => handleNurseryInputChange('address', event.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={t('nurserySection.phone')}
                        value={nurseryForm.phone}
                        onChange={(event) => handleNurseryInputChange('phone', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label={t('nurserySection.area')}
                        type="number"
                        value={nurseryForm.area}
                        onChange={(event) => handleNurseryInputChange('area', event.target.value)}
                        fullWidth
                      />
                    </Stack>

                    {/* <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label={t('nurserySection.latitude')}
                        type="number"
                        value={nurseryForm.latitude}
                        onChange={(event) =>
                          handleNurseryInputChange('latitude', event.target.value)
                        }
                        fullWidth
                      />
                      <TextField
                        label={t('nurserySection.longitude')}
                        type="number"
                        value={nurseryForm.longitude}
                        onChange={(event) =>
                          handleNurseryInputChange('longitude', event.target.value)
                        }
                        fullWidth
                      />
                    </Stack> */}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={nurseryForm.isActive}
                          onChange={(event) =>
                            handleNurseryInputChange('isActive', event.target.checked)
                          }
                        />
                      }
                      label={t('nurserySection.isActive')}
                    />
                  </Stack>

                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleNurserySave}
                      disabled={nurserySaving}
                      sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
                    >
                      {nurserySaving ? t('saving') : tCommon('save')}
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { getFengShuiColors, getFengShuiElementKey } from '@/lib/utils/fengShui';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { getUserProfile, updateUserProfile, updateUserAvatar } from '@/lib/api/userProfileService';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import SetPasswordModal from '@/components/profile/SetPasswordModal';
import SubscriptionBadge from '@/components/profile/SubscriptionBadge';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { isValidPhoneNumber10Digits } from '@/lib/utils/phoneNumber';
import { useTranslations } from 'next-intl';
import type { SubscriptionTier, UserProfile, UpdateUserProfileRequest } from '@/types/auth.types';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import { searchAddressSuggestions, type AddressSuggestion } from '@/lib/utils/geocoding';
import { CustomLoading } from '@/components/CustomLoading';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const { setUserSubscription } = useAuthStore();

  type AvatarResponsePayload = {
    avatarURL?: string;
    avatarUrl?: string;
  };

  const normalizeGender = (gender: UserProfile['gender']): 'Unknown' | 'Male' | 'Female' | 'Other' => {
    if (gender === 'Male' || gender === 'Female' || gender === 'Other' || gender === 'Unknown') {
      return gender;
    }

    if (gender === 1) return 'Male';
    if (gender === 2) return 'Female';
    return 'Unknown';
  };

  const pickDefined = <T,>(next: T | null | undefined, fallback: T | null | undefined): T | undefined => {
    if (next === null || next === undefined) return fallback ?? undefined;
    return next;
  };
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [originalProfile, setOriginalProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; phoneNumber?: string }>({});
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openSetPassword, setOpenSetPassword] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingAddressSuggestions, setLoadingAddressSuggestions] = useState(false);
  const [addressInputValue, setAddressInputValue] = useState('');

  const isFullNameInvalid = !(profile.fullName ?? '').trim();
  const isUsernameInvalid = !(profile.username ?? '').trim();
  const phoneNumberTrimmed = (profile.phoneNumber ?? '').trim();
  const isPhoneNumberInvalid = !isValidPhoneNumber10Digits(phoneNumberTrimmed);

  // Fetch profile on mount
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserProfile(false);
      console.log('Fetched profile:', response);
      if (response?.payload) {
        const userData = response.payload;
        // Map API response to component state
        const subscription: SubscriptionTier = (userData.subscription as SubscriptionTier) ?? 'Bronze';
        const mappedData: Partial<UserProfile> = {
          id: userData.id,
          username: userData.username || '',
          fullName: userData.fullName || '',
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          avatarUrl: userData.avatarUrl,
          address: userData.address || '',
          gender: normalizeGender(userData.gender),
          birthDate: userData.birthDate || '',
          fengshuiElement: userData.fengshuiElement || '',
          subscription,
          latitude: userData.latitude ?? 0,
          longitude: userData.longitude ?? 0,
          receiveNotifications: userData.receiveNotifications ?? true,
        };

        setProfile(mappedData);
        setOriginalProfile(mappedData);
        setAddressInputValue(userData.address || '');
        setUserSubscription(subscription);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorLoadingProfile');
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [t, setUserSubscription]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  // Fetch address suggestions when user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (addressInputValue && addressInputValue.trim().length >= 3) {
        setLoadingAddressSuggestions(true);
        try {
          const suggestions = await searchAddressSuggestions(addressInputValue);
          setAddressSuggestions(suggestions);
        } catch (err) {
          console.error('Error fetching address suggestions:', err);
          setAddressSuggestions([]);
        } finally {
          setLoadingAddressSuggestions(false);
        }
      } else {
        setAddressSuggestions([]);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [addressInputValue]);

  const handleInputChange = (field: keyof UserProfile, value: UserProfile[keyof UserProfile]) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'username' || field === 'phoneNumber') {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSelectAddressSuggestion = (value: AddressSuggestion | string | null) => {
     if (!value) {
       // User cleared the field
       setProfile((prev) => ({
         ...prev,
         address: '',
         latitude: 0,
         longitude: 0,
       }));
       setAddressInputValue('');
       setAddressSuggestions([]);
       return;
     }

     // Check if it's a suggestion object (user selected from dropdown)
     if (typeof value === 'object' && 'display_name' in value) {
       setProfile((prev) => ({
         ...prev,
         address: value.display_name,
         latitude: value.latitude,
         longitude: value.longitude,
       }));
       setAddressInputValue(value.display_name);
       setAddressSuggestions([]);
     }
     // If it's a string (user typed custom address without selecting suggestion)
     // Keep the address as-is, set lat/long to 0
     else if (typeof value === 'string') {
       setProfile((prev) => ({
         ...prev,
         address: value,
         latitude: 0,
         longitude: 0,
       }));
       setAddressInputValue(value);
       setAddressSuggestions([]);
     }
   };

  const handleAddressInputChange = (value: string) => {
    setAddressInputValue(value);
    setProfile((prev) => ({
      ...prev,
      address: value,
      latitude: 0,
      longitude: 0,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const fullName = (profile.fullName || '').trim();
      const username = (profile.username || '').trim();
      const phoneNumber = (profile.phoneNumber || '').trim();

      setFieldErrors({});

      if (!fullName) {
        setError(t('fullNameRequired'));
        return;
      }

      if (!username) {
        setFieldErrors({ username: t('usernameRequired') });
        return;
      }

      if (!phoneNumber) {
        setFieldErrors({ phoneNumber: t('phoneNumberRequired') });
        return;
      }

      if (!isValidPhoneNumber10Digits(phoneNumber)) {
        setFieldErrors({ phoneNumber: t('phoneNumberInvalid') });
        return;
      }

      setIsSaving(true);
      setError(null);

      // Build request matching API format
      const request: UpdateUserProfileRequest = {
        userName: username,
        phoneNumber,
        fullName,
        address: profile.address || '',
        birthDate: profile.birthDate || '',
        gender: normalizeGender(profile.gender),
        latitude: profile.latitude ?? 0,
        longitude: profile.longitude ?? 0,
        receiveNotifications: profile.receiveNotifications ?? true,
      };

      const response = await updateUserProfile(request, false);

      if (response?.payload) {
        // API có thể trả gender null/không trả => tránh overwrite state hiện tại
        const payload = response.payload as Partial<UserProfile>;
        const nextGender = pickDefined(payload.gender, request.gender);

        const updatedData: Partial<UserProfile> = {
          ...profile,
          ...payload,
          gender: normalizeGender(nextGender as UserProfile['gender']),
        };

        setProfile(updatedData);
        setOriginalProfile(updatedData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorSavingProfile');
      setError(errorMessage);
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/heif'];

      if (!allowedFormats.includes(file.type)) {
        alert(t('unsupportedFormat'));
        return;
      }

      if (file.size > maxSize) {
        alert(t('fileSizeExceeded'));
        return;
      }

      const response = await updateUserAvatar(file, false);

      if (response?.payload) {
        const payloadData = response.payload as AvatarResponsePayload;
        const newAvatarUrl = payloadData.avatarURL || payloadData.avatarUrl;
        if (newAvatarUrl) {
          setProfile((prev) => ({
            ...prev,
            avatarUrl: newAvatarUrl,
          }));
          setOriginalProfile((prev) => ({
            ...prev,
            avatarUrl: newAvatarUrl,
          }));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorUploadingAvatar');
      console.error('Error uploading avatar:', err);
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        {t('title')}
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingOverlay />
        </Box>
      )}

      {!isLoading && (
        <>
          {/* Avatar Section */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
                {/* Avatar */}
                <Box sx={{ position: 'relative' }}>
                  {profile.avatarUrl ? (
                  <ClickableImageViewer
                    images={[profile.avatarUrl]}
                    alt={profile.fullName || profile.username || 'User Avatar'}
                    className='rounded-full aspect-square object-cover shadow-md'
                    containerClassName='block xs:w-[120px] md:w-37.5 xs:h-[120px] md:h-37.5'
                    showZoomHint={false}
                  />
                  ) : (
                  <Box
                    sx={{
                    width: { xs: '120px', md: '150px' },
                    height: { xs: '120px', md: '150px' },
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    {(profile.username || '').charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                  )}
                  <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'var(--primary)',
                    color: 'black',
                    ":hover": {
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    },
                    ...hoverLiftStyle,
                  }}
                  size="large"
                  disabled={isSaving}
                  >
                  <PhotoCameraIcon fontSize="large"/>
                  <input
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/heif"
                    type="file"
                    onChange={handleAvatarUpload}
                    disabled={isSaving}
                  />
                  </IconButton>
                </Box>

                {/* Name, Email and Subscription */}
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {profile.fullName || profile.username}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profile.email}
                  </Typography>
                  <SubscriptionBadge tier={profile.subscription} variant="chip" />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'row', md: 'column' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<LockResetIcon />}
                    size="small"
                    onClick={() => setOpenChangePassword(true)}
                    disabled={isSaving}
                  >
                    {t('changePassword')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<VpnKeyIcon />}
                    size="small"
                    onClick={() => setOpenSetPassword(true)}
                    disabled={isSaving}
                  >
                    {t('setPassword')}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Profile Information Form */}
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                {t('personalInfo')}
              </Typography>

              {/* Two-column layout for form fields */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Username */}
                <TextField
                  label={t('username') || 'Username'}
                  value={profile.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  error={Boolean(fieldErrors.username)}
                  helperText={fieldErrors.username || ' '}
                  fullWidth
                  disabled={isSaving}
                />

                {/* Full Name */}
                <TextField
                  label={tAuth('fullName')}
                  value={profile.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  fullWidth
                  required
                  disabled={isSaving}
                />

                {/* Phone Number */}
                <TextField
                  label={tAuth('phone')}
                  type='number'
                  value={profile.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={Boolean(fieldErrors.phoneNumber)}
                  helperText={fieldErrors.phoneNumber || ' '}
                  fullWidth
                  disabled={isSaving}
                />

                {/* Email - Read Only */}
                <TextField
                  label={tAuth('email')}
                  value={profile.email || ''}
                  fullWidth
                  required
                  type="email"
                  disabled
                />

                {/* Gender */}
                <TextField
                  label={t('gender')}
                  value={profile.gender || 'Unknown'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  fullWidth
                  select
                  disabled={isSaving}
                >
                  <MenuItem value="Unknown">{t('unknown') || 'Unknown'}</MenuItem>
                  <MenuItem value="Male">{t('male')}</MenuItem>
                  <MenuItem value="Female">{t('female')}</MenuItem>
                </TextField>

                {/* Birth Date */}
                <TextField
                  label="Date of birth"
                  value={profile.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  fullWidth
                  type="date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: new Date().toISOString().split('T')[0] } }}
                  disabled={isSaving}
                />

                {/* Feng Shui Element — read-only, calculated by BE from birthDate */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Feng Shui element
                  </Typography>
                  {profile.fengshuiElement ? (() => {
                    const colors = getFengShuiColors(profile.fengshuiElement);
                    const key = getFengShuiElementKey(profile.fengshuiElement);
                    const viLabels: Record<string, string> = { kim: 'Kim (Metal)', moc: 'Mộc (Wood)', thuy: 'Thủy (Water)', hoa: 'Hỏa (Fire)', tho: 'Thổ (Earth)' };
                    return (
                      <Chip
                        label={viLabels[key] ?? profile.fengshuiElement}
                        sx={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600, width: 'fit-content' }}
                      />
                    );
                  })() : (
                    <Chip label="Not yet determined" variant="outlined" sx={{ width: 'fit-content', color: 'text.secondary' }} />
                  )}
                </Box>

                {/* Subscription tier — read-only, set by backend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Membership tier
                  </Typography>
                  <SubscriptionBadge tier={profile.subscription} variant="inline" />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Address Section */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                {t('shippingAddress')}
              </Typography>
              <Autocomplete
                freeSolo
                options={addressSuggestions}
                filterOptions={(options) => options}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.display_name || '';
                }}
                inputValue={addressInputValue}
                onInputChange={(e, value) => handleAddressInputChange(value)}
                onChange={(e, value) => handleSelectAddressSuggestion(value)}
                loading={loadingAddressSuggestions}
                disabled={isSaving}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('detailedAddress')}
                    placeholder={t('addressPlaceholder')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingAddressSuggestions ? (
                            <CustomLoading size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="Không tìm thấy địa chỉ"
                loadingText="Đang tìm kiếm..."
              />
            </CardContent>
          </Card>

          {/* Settings Section */}
          {/* <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                {t('notificationSettings')}
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={profile.receiveNotifications ?? true}
                    onChange={(e) => handleInputChange('receiveNotifications', e.target.checked)}
                    color="primary"
                    disabled={isSaving}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {t('receiveNotifications')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('notificationDescription')}
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card> */}

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setProfile(originalProfile)}
              disabled={isSaving}
              sx={{":hover": {backgroundColor: 'var(--error)', color: 'white'}, ...hoverLiftStyle}}
            >
              {t('cancelChanges')}
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={isSaving ? <CustomLoading size={20} /> : <SaveIcon />}
              onClick={handleSaveChanges}
              disabled={isSaving || isFullNameInvalid || isUsernameInvalid || isPhoneNumberInvalid}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: 'var(--primary)',
                fontWeight: 'bold',
                ...hoverLiftStyle,
              }}
            >
              {isSaving ? t('saving') || 'Saving...' : t('saveChanges')}
            </Button>
          </Box>

          {/* Change Password Modal */}
          <ChangePasswordModal
            open={openChangePassword}
            onClose={() => setOpenChangePassword(false)}
          />

          {/* Set Password Modal */}
          <SetPasswordModal
            open={openSetPassword}
            onClose={() => setOpenSetPassword(false)}
          />
        </>
      )}
    </Box>
  );
}

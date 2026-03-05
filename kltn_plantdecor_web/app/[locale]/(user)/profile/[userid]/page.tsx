'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import { userProfileData } from '@/data/dashboardMockData';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { useTranslations } from 'next-intl';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const [profile, setProfile] = useState(userProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    // TODO: API call to update profile
    console.log('Saving profile:', profile);
    setIsEditing(false);
    // Show success notification
  };

  const handleAvatarUpload = () => {
    // TODO: Handle avatar upload
    console.log('Upload avatar');
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        {t('title')}
      </Typography>

      {/* Avatar Section */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.avatarUrl}
                alt={profile.fullName}
                sx={{
                  width: { xs: 120, md: 150 },
                  height: { xs: 120, md: 150 },
                  boxShadow: 3,
                }}
              />
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
                  >
                  <PhotoCameraIcon fontSize="large"/>
                  <input
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/heif"
                    type="file"
                    onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
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

                      const reader = new FileReader();
                      reader.onloadend = () => {
                      handleInputChange('avatarUrl', reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                    }}
                  />
                  </IconButton>
            </Box>

            {/* Name and Email */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {profile.fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'row', md: 'column' } }}>
              <Button
                variant="outlined"
                startIcon={<LockResetIcon />}
                size="small"
                onClick={() => setOpenChangePassword(true)}
              >
                {t('changePassword')}
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
            {/* Full Name */}
            <TextField
              label={tAuth('fullName')}
              value={profile.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              fullWidth
              required
            />

            {/* Phone Number */}
            <TextField
              label={tAuth('phone')}
              value={profile.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              fullWidth
              required
            />

            {/* Email */}
            <TextField
              label={tAuth('email')}
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              required
              type="email"
              disabled // Email usually shouldn't be changed directly
            />

            {/* Gender */}
            <TextField
              label={t('gender')}
              value={profile.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="Male">{t('male')}</MenuItem>
              <MenuItem value="Female">{t('female')}</MenuItem>
              <MenuItem value="Other">{t('other')}</MenuItem>
            </TextField>

            {/* Birth Year */}
            <TextField
              label={t('birthYear')}
              value={profile.birthYear}
              onChange={(e) => handleInputChange('birthYear', parseInt(e.target.value))}
              fullWidth
              type="number"
              inputProps={{ min: 1940, max: new Date().getFullYear() }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Address Section */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            {t('shippingAddress')}
          </Typography>
          <TextField
            label={t('detailedAddress')}
            value={profile.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder={t('addressPlaceholder')}
          />
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            {t('notificationSettings')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={profile.receiveNotifications}
                onChange={(e) => handleInputChange('receiveNotifications', e.target.checked)}
                color="primary"
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
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" size="large" onClick={() => setProfile(userProfileData)} 
        sx={{":hover": {backgroundColor: 'var(--error)', color: 'white'}, ...hoverLiftStyle}}>
          {t('cancelChanges')}
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          sx={{
            px: 4,
            py: 1.5,
            backgroundColor: 'var(--primary)',
            fontWeight: 'bold',
            ...hoverLiftStyle,
          }}
        >
          {t('saveChanges')}
        </Button>
      </Box>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      />
    </Box>
  );
}

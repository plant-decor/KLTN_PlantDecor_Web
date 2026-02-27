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

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const [profile, setProfile] = useState(userProfileData);
  const [isEditing, setIsEditing] = useState(false);

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
        Hồ sơ cá nhân
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
                onClick={handleAvatarUpload}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                size="small"
              >
                <PhotoCameraIcon />
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
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  backgroundColor:
                    profile.membershipLevel === 'Platinum'
                      ? '#e5e7eb'
                      : profile.membershipLevel === 'Gold'
                      ? '#fef3c7'
                      : profile.membershipLevel === 'Silver'
                      ? '#f3f4f6'
                      : '#fef2f2',
                  color:
                    profile.membershipLevel === 'Platinum'
                      ? '#1f2937'
                      : profile.membershipLevel === 'Gold'
                      ? '#92400e'
                      : profile.membershipLevel === 'Silver'
                      ? '#374151'
                      : '#991b1b',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {profile.membershipLevel} Member
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'row', md: 'column' } }}>
              <Button
                variant="outlined"
                startIcon={<LockResetIcon />}
                size="small"
                onClick={() => console.log('Change password')}
              >
                Đổi mật khẩu
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Profile Information Form */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Thông tin cá nhân
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
              label="Họ và tên"
              value={profile.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              fullWidth
              required
            />

            {/* Phone Number */}
            <TextField
              label="Số điện thoại"
              value={profile.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              fullWidth
              required
            />

            {/* Email */}
            <TextField
              label="Email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              required
              type="email"
              disabled // Email usually shouldn't be changed directly
            />

            {/* Gender */}
            <TextField
              label="Giới tính"
              value={profile.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="Male">Nam</MenuItem>
              <MenuItem value="Female">Nữ</MenuItem>
              <MenuItem value="Other">Khác</MenuItem>
            </TextField>

            {/* Birth Year */}
            <TextField
              label="Năm sinh"
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
            Địa chỉ giao hàng
          </Typography>
          <TextField
            label="Địa chỉ chi tiết"
            value={profile.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
          />
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Cài đặt thông báo
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
                  Nhận thông báo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhận nhắc nhở chăm sóc cây, thông tin khuyến mãi và cập nhật mới
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" size="large" onClick={() => setProfile(userProfileData)}>
          Hủy thay đổi
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
          }}
        >
          Lưu thay đổi
        </Button>
      </Box>
    </Box>
  );
}

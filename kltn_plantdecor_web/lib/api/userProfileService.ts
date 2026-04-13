'use client';

import * as apiClient from '@/lib/api/apiService.client';
import type { ResponseModel } from '@/types/api.types';
import type { UpdateUserProfileRequest, UserProfile } from '@/types/auth.types';

export const getUserProfile = async (
  loading = true
): Promise<ResponseModel<UserProfile>> => {
  return apiClient.get('/User/user-profile', undefined, loading);
};

export const updateUserProfile = async (
  request: UpdateUserProfileRequest,
  loading = true
): Promise<ResponseModel<UserProfile>> => {
  return apiClient.put('/User/user-profile', request, loading);
};

export const updateUserAvatar = async (
  file: File,
  loading = true
): Promise<ResponseModel<unknown>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.put('/User/avatar', formData, loading, {
    showToast: false,
    showErrorToast: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

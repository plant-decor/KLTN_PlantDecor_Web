'use server';

import type { LoginResponse } from '@/types/auth.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

/**
 * Server Action: Đổi mật khẩu
 * 
 * Luồng:
 * 1. Nhận oldPassword, newPassword từ client
 * 3. Gọi API C# để đổi mật khẩu
 * 4. Trả về success/error
 */
export async function changePasswordAction(
  oldPassword: string,
  newPassword: string,
): Promise<ChangePasswordResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Gửi cookie để xác định user
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Đổi mật khẩu thất bại',
      };
    }

    const data = await response.json();

    // Bước 4: Trả về success
    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công',
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Lỗi server khi đổi mật khẩu',
    };
  }
}


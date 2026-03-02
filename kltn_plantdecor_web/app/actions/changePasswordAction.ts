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
 * 2. Verify reCAPTCHA token nếu có
 * 3. Gọi API C# để đổi mật khẩu
 * 4. Trả về success/error
 */
export async function changePasswordAction(
  oldPassword: string,
  newPassword: string,
  recaptchaToken?: string
): Promise<ChangePasswordResponse> {
  try {
    // Bước 2: Verify reCAPTCHA token nếu có
    if (recaptchaToken) {
      const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaVerified) {
        return {
          success: false,
          message: 'reCAPTCHA verification failed. Please try again.',
        };
      }
    }

    // Bước 3: Gọi API C# để đổi mật khẩu
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

/**
 * Verify reCAPTCHA v2 token with Google
 */
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not configured');
      return true; // Allow if secret key not configured
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    const isValid = Boolean(data.success);
    
    if (!isValid) {
      console.warn('reCAPTCHA verification failed:', {
        success: data.success,
        errorCodes: data['error-codes'],
      });
    }

    return isValid;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

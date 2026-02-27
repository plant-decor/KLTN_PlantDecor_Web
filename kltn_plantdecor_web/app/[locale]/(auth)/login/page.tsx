'use client';

import AuthFormContainer from '@/components/auth/AuthFormContainer';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login Page
 * 
 * Sử dụng LoginForm component để handle đăng nhập
 * LoginForm sẽ gọi Server Action (loginAction) để thực hiện login
 */
export default function LoginPage() {
  return (
    <AuthFormContainer />
  );
}

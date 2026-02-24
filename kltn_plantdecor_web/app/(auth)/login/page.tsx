'use client';

import LoginForm from '@/components/LoginForm';

/**
 * Login Page
 * 
 * Sử dụng LoginForm component để handle đăng nhập
 * LoginForm sẽ gọi Server Action (loginAction) để thực hiện login
 */
export default function LoginPage() {
  return (
    <LoginForm />
  );
}

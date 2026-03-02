'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { loginAction } from '@/app/actions/loginAction';
import { useFailedLoginAttempts } from '@/hooks/useFailedLoginAttempts';
import Image from 'next/image';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import SignUpForm from './SignUpForm';

type FormType = 'login' | 'forgot' | 'signup';

export default function AuthFormContainer() {
  const [currentForm, setCurrentForm] = useState<FormType>('login');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useAuthStore();
  const { incrementFailedAttempts, resetFailedAttempts } = useFailedLoginAttempts();

  const handleLoginSubmit = async (email: string, password: string, recaptchaToken?: string) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await loginAction(email, password, recaptchaToken);

      if (!result.success) {
        // Only increment failed attempts if recaptcha wasn't required or failed
        if (!requiresRecaptcha()) {
          incrementFailedAttempts();
        }
        setError(result.message || 'Đăng nhập thất bại');
        // Tăng số lần thất bại
        incrementFailedAttempts();
        return;
      }

      // Đăng nhập thành công - reset số lần thất bại
      resetFailedAttempts();

      if (result.user) {
        setUser(result.user);
        resetFailedAttempts(); // Clear failed attempts on successful login
      }

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      if (!requiresRecaptcha()) {
        incrementFailedAttempts();
      }
      setError('Lỗi khi đăng nhập');
      // Tăng số lần thất bại khi có lỗi
      incrementFailedAttempts();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (!email) {
        setError('Vui lòng nhập email');
        return;
      }
      // TODO: Implement forgot password API call
      setMessage('Link đặt lại mật khẩu đã được gửi đến email của bạn');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Lỗi khi gửi link đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu không khớp');
        return;
      }

      if (formData.name.trim() === '') {
        setError('Vui lòng nhập tên đầy đủ');
        return;
      }

      // TODO: Implement sign up API call
      console.log('Sign up data prepared for API call:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      setMessage('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      setTimeout(() => {
        setCurrentForm('login');
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Lỗi khi tạo tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentForm('login');
    setError('');
    setMessage('');
  };

  return (
    <div className="w-full relative flex justify-center items-center h-screen bg-gray-200">
      <Image
        src="/img/background-login.jpg"
        fill
        alt="Login Background Image with plants decoration in a cozy room setting, featuring a comfortable armchair, a small coffee table with a cup of tea, and various potted plants around, creating a warm and inviting atmosphere."
        className="object-cover object-center opacity-50 blur-xs"
      />

      {/* Login Form */}
      {currentForm === 'login' && (
        <div className="lg:w-4/5 lg:h-4/5 w-full h-5/6 flex border border-black rounded-[30px] bg-white z-10 overflow-hidden">
          <LoginForm
            isVisible={true}
            onForgotPassword={() => setCurrentForm('forgot')}
            onSignUp={() => setCurrentForm('signup')}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}

      {/* Forgot Password Form */}
      {currentForm === 'forgot' && (
        <div className="lg:w-4/5 lg:h-4/5 w-full h-5/6 flex border border-black rounded-[30px] bg-white z-10 overflow-hidden">
          <ForgotPasswordForm
            isVisible={true}
            onBack={handleBackToLogin}
            onSubmit={handleForgotPasswordSubmit}
            isLoading={isLoading}
            error={error}
            message={message}
          />
        </div>
      )}

      {/* Sign Up Form */}
      {currentForm === 'signup' && (
        <div className="lg:w-4/5 lg:h-4/5 w-full h-5/6 flex border border-black rounded-[30px] bg-white z-10 overflow-hidden">
          <SignUpForm
            isVisible={true}
            onBack={handleBackToLogin}
            onSubmit={handleSignUpSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

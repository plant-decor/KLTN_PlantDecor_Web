'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
} from '@/app/actions/authenticationActions';
import { getDeviceId } from '@/lib/utils/deviceId';
import Image from 'next/image';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import SignUpForm from './SignUpForm';

type FormType = 'login' | 'forgot' | 'signup';

export default function AuthFormContainer() {
  const [currentForm, setCurrentForm] = useState<FormType>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  const handleLoginSubmit = async (email: string, password: string) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const deviceId = getDeviceId();
      document.cookie = `deviceId=${encodeURIComponent(deviceId)}; Max-Age=31536000; Path=/; SameSite=Lax`;

      const result = await loginAction(email, password);

      if (!result.success) {
        const loginMessage = result.message || 'Đăng nhập thất bại';

        if (loginMessage.toLowerCase().includes('not been verified')) {
          setError('Tài khoản chưa xác thực email. Vui lòng kiểm tra mailbox và bấm link xác thực.');
          return;
        }

        setError(loginMessage);
        return;
      }

      if (result.user) {
        setUser(result.user);
      }

      const redirectToRaw = searchParams.get('redirectTo');
      const redirectTo = redirectToRaw && redirectToRaw.startsWith('/')
        ? redirectToRaw
        : '/';
      const resolvedRedirectTo = result.user?.id
        ? redirectTo.replace(/\[(userid|userId)\]/g, String(result.user.id))
        : redirectTo;

      setTimeout(() => {
        router.push(resolvedRedirectTo);
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi khi đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (!email) {
        setError('Vui lòng nhập email');
        return;
      }

      const result = await forgotPasswordAction({ email: email.trim() });

      if (!result.success) {
        setError(result.message || 'Lỗi khi gửi link đặt lại mật khẩu');
        return;
      }

      setMessage(result.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Lỗi khi gửi link đặt lại mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (formData: {
    email: string;
    password: string;
    confirmPassword: string;
    userName: string;
    fullName: string;
    phoneNumber: string;
  }) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu không khớp');
        return;
      }

      if (formData.fullName.trim() === '') {
        setError('Vui lòng nhập tên đầy đủ');
        return;
      }

      if (formData.userName.trim() === '') {
        setError('Vui lòng nhập tên đăng nhập');
        return;
      }

      if (formData.phoneNumber.trim() === '') {
        setError('Vui lòng nhập số điện thoại');
        return;
      }

      const result = await registerAction({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.userName.trim(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      if (!result.success) {
        setError(result.message || 'Lỗi khi tạo tài khoản');
        return;
      }

      const successMessage = result.message || 'Tạo tài khoản thành công! Vui lòng kiểm tra email để xác thực.';
      toast.success(successMessage);
      setMessage(successMessage);
      setTimeout(() => {
        setCurrentForm('login');
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Lỗi khi tạo tài khoản');
    } finally {
      setIsSubmitting(false);
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
            onForgotPassword={() => setCurrentForm('forgot')}
            onSignUp={() => setCurrentForm('signup')}
            onSubmit={handleLoginSubmit}
            error={error}
            isLoading={isSubmitting}
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
            isLoading={isSubmitting}
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
            isLoading={isSubmitting}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

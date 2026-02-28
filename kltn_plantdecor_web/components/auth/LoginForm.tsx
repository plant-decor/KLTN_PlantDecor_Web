'use client';

import { useState } from 'react';
import { EmailOutlined, LockOutline, LockOpen } from '@mui/icons-material';
import Image from 'next/image';
import RecaptchaField from './RecaptchaField';
import { useFailedLoginAttempts } from '@/hooks/useFailedLoginAttempts';

interface LoginFormProps {
  isVisible: boolean;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSubmit: (email: string, password: string, recaptchaToken?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function LoginForm({
  isVisible,
  onForgotPassword,
  onSignUp,
  onSubmit,
  isLoading = false,
  error = '',
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');

  const { requiresRecaptcha, getRemainingAttempts } = useFailedLoginAttempts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== LOGIN FORM SUBMISSION ===');
    console.log({
      email,
      password,
      timestamp: new Date().toISOString(),
    });
    setErrors({});
    await onSubmit(email, password, recaptchaToken || undefined);
  };

  return (
    <>
      {/* Background */}
      <div className="w-[65%] lg:flex hidden items-center justify-center overflow-hidden rounded-[30px]">
        <Image
          src="/img/background-login.jpg"
          alt="Background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Container */}
      <div className="lg:w-[35%] w-full h-full relative flex flex-col justify-center items-center space-y-4 lg:space-y-5">
        <Image
          src="/logo/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="absolute top-8 right-8 w-32 h-32 object-contain"
        />

        <div className="w-full h-full flex flex-col justify-center items-center px-8">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <h1 className="text-3xl font-semibold text-center mb-8">
              Welcome User
            </h1>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {requiresRecaptcha() && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-yellow-800 text-sm font-semibold mb-2">
                  Too many failed attempts
                </p>
                <p className="text-yellow-700 text-xs mb-3">
                  For security reasons, please complete the reCAPTCHA verification.
                </p>
                <RecaptchaField
                  onToken={setRecaptchaToken}
                  onError={(error) => console.error('reCAPTCHA error:', error)}
                  isLoading={isLoading}
                  showMessage={false}
                />
              </div>
            )}

            {requiresRecaptcha() && getRemainingAttempts() === 0 && (
              <div className="text-yellow-700 text-xs text-center">
                You have exceeded the maximum number of login attempts. Please complete reCAPTCHA.
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <span
                className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                  email || isEmailFocused
                    ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                    : "text-base"
                }`}
              >
                Email
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm absolute">
                  {errors.email}
                </p>
              )}
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
                <EmailOutlined className="w-5 h-5" />
              </span>
            </div>

            {/* Password Field */}
            <div className="relative">
              <span
                className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                  password || isPasswordFocused
                    ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                    : "text-base"
                }`}
              >
                Password
              </span>
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 cursor-pointer"
              >
                {isPasswordVisible ? (
                  <LockOpen className="w-5 h-5" />
                ) : (
                  <LockOutline className="w-5 h-5" />
                )}
              </span>
              {errors.password && (
                <p className="text-red-500 text-sm absolute">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-500 text-sm font-medium hover:underline hover:text-blue-700! focus:outline-none transition-all"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Google Login Button */}
            <button
              type="button"
              className="w-full h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" width="20" height="20" />
              </svg>
              <span>Login with Google</span>
            </button>

            {/* Sign Up Button */}
            <button
              type="button"
              onClick={onSignUp}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

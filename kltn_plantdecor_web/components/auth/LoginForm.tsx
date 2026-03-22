'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { EmailOutlined, LockOutline, LockOpen } from '@mui/icons-material';
import Image from 'next/image';
import GoogleLoginButton from './GoogleLoginButton';

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function LoginForm({
  onForgotPassword,
  onSignUp,
  onSubmit,
  isLoading = false,
  error = '',
}: LoginFormProps) {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    await onSubmit(email, password);
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
              {t('welcomeUser')}
            </h1>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
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
                {t('email')}
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
                {t('password')}
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
                {t('forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
              {isLoading ? t('loggingIn') : t('loginButton')}
            </button>
              </form>
              <div className="w-full max-w-sm flex space-y-2 pt-2 flex-col justify-center items-center">
              {/* Google Login Button */}
            <GoogleLoginButton />
            
            {/* Sign Up Button */}
            <button
              type="button"
              onClick={onSignUp}
              className="w-full h-12 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none"
              >
              {t('signUp')}
            </button>
              </div>
        </div>
      </div>
    </>
  );
}


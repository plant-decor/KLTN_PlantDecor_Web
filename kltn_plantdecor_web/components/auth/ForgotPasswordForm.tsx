'use client';

import { useState } from 'react';
import { EmailOutlined } from '@mui/icons-material';
import Image from 'next/image';

interface ForgotPasswordFormProps {
  isVisible: boolean;
  onBack: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  message?: string;
}

export default function ForgotPasswordForm({
  isVisible,
  onBack,
  onSubmit,
  isLoading = false,
  error = '',
  message = '',
}: ForgotPasswordFormProps) {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordEmailFocused, setIsForgotPasswordEmailFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORGOT PASSWORD FORM SUBMISSION ===');
    console.log({
      email: forgotPasswordEmail,
      timestamp: new Date().toISOString(),
    });
    await onSubmit(forgotPasswordEmail);
  };

  return (
    <>
      {/* Background */}
      <div className="w-[65%] lg:flex hidden items-center justify-center overflow-hidden rounded-[30px]">
        <Image
          src="/img/background-login.jpg"
          alt="Forgot Password Background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Container */}
      <div className="lg:w-[35%] w-full h-full relative flex flex-col justify-center items-center px-8 animate-fade-in-up">
        <Image
          src="/logo/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="absolute top-8 right-8 w-32 h-32 object-contain"
        />

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <h1 className="text-3xl font-semibold text-center mb-8">
            Forgot Password
          </h1>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
              {message}
            </div>
          )}

          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                forgotPasswordEmail || isForgotPasswordEmailFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              Email
            </span>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              onFocus={() => setIsForgotPasswordEmailFocused(true)}
              onBlur={() => setIsForgotPasswordEmailFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <EmailOutlined className="w-5 h-5" />
            </span>
          </div>

          <div className="flex flex-col items-center space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full h-12 border-2 border-gray-500 text-gray-600 font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

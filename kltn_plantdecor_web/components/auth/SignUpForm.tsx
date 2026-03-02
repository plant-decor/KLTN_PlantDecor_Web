'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import {
  EmailOutlined,
  LockOutline,
  LockOpen,
  PersonOutline,
  PhoneOutlined,
  HomeOutlined,
} from '@mui/icons-material';
import Image from 'next/image';

interface SignUpFormProps {
  isVisible: boolean;
  onBack: () => void;
  onSubmit: (formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function SignUpForm({
  isVisible,
  onBack,
  onSubmit,
  isLoading = false,
  error = '',
}: SignUpFormProps) {
  const t = useTranslations('auth');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);
  const [isSignUpConfirmPasswordVisible, setIsSignUpConfirmPasswordVisible] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: signUpName,
      email: signUpEmail,
      phone: signUpPhone,
      address: signUpAddress,
      password: signUpPassword,
      confirmPassword: signUpConfirmPassword,
    };
    console.log('=== SIGN UP FORM SUBMISSION ===');
    console.log({
      ...formData,
      timestamp: new Date().toISOString(),
    });
    await onSubmit(formData);
  };

  return (
    <>
      {/* Background */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{
          x: isVisible ? "100%" : "0%",
          opacity: isVisible ? 1 : 0,
        }}
        exit={{
          x: "100%",
          opacity: 0,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-[65%] lg:flex hidden items-center justify-center overflow-hidden rounded-[30px]"
      >
        <Image
          src="/img/background-login.jpg"
          alt="Sign Up Background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{
          x: isVisible ? "-100%" : "0%",
          opacity: isVisible ? 1 : 0,
        }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="lg:w-[65%] w-full h-full relative flex flex-col justify-center items-center overflow-y-auto"
      >
        <Image
          src="/logo/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="absolute top-8 right-8 w-32 h-32 object-contain"
        />

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <h1 className="text-3xl font-semibold text-center mb-6">{t('createAccount')}</h1>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpName || isNameFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('fullName')}
            </span>
            <input
              type="text"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <PersonOutline className="w-5 h-5" />
            </span>
          </div>

          {/* Email Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpEmail || isEmailFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('email')}
            </span>
            <input
              type="email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <EmailOutlined className="w-5 h-5" />
            </span>
          </div>

          {/* Phone Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpPhone || isPhoneFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('phone')}
            </span>
            <input
              type="tel"
              value={signUpPhone}
              onChange={(e) => setSignUpPhone(e.target.value)}
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <PhoneOutlined className="w-5 h-5" />
            </span>
          </div>

          {/* Address Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpAddress || isAddressFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('address')}
            </span>
            <input
              type="text"
              value={signUpAddress}
              onChange={(e) => setSignUpAddress(e.target.value)}
              onFocus={() => setIsAddressFocused(true)}
              onBlur={() => setIsAddressFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <HomeOutlined className="w-5 h-5" />
            </span>
          </div>

          {/* Password Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpPassword || isPasswordFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('password')}
            </span>
            <input
              type={isSignUpPasswordVisible ? "text" : "password"}
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              onClick={() => setIsSignUpPasswordVisible(!isSignUpPasswordVisible)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 cursor-pointer"
            >
              {isSignUpPasswordVisible ? (
                <LockOpen className="w-5 h-5" />
              ) : (
                <LockOutline className="w-5 h-5" />
              )}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <span
              className={`absolute left-2 top-2 text-gray-500 transition-all pointer-events-none ${
                signUpConfirmPassword || isConfirmPasswordFocused
                  ? "text-xs -translate-y-7 bg-white px-2 text-blue-500"
                  : "text-base"
              }`}
            >
              {t('confirmPassword')}
            </span>
            <input
              type={isSignUpConfirmPasswordVisible ? "text" : "password"}
              value={signUpConfirmPassword}
              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              className="w-full h-12 p-2 pl-8 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              onClick={() => setIsSignUpConfirmPasswordVisible(!isSignUpConfirmPasswordVisible)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 cursor-pointer"
            >
              {isSignUpConfirmPasswordVisible ? (
                <LockOpen className="w-5 h-5" />
              ) : (
                <LockOutline className="w-5 h-5" />
              )}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col items-center space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('creating') : t('createAccount')}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full h-12 border-2 border-gray-500 text-gray-600 font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none"
            >
              {t('backToLogin')}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

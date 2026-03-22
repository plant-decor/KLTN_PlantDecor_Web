'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LockOutline, LockOpen, MailOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { resetPasswordAction } from '@/app/actions/authenticationActions';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const getLocaleLoginPath = (locale?: string): string => {
  if (!locale) {
    return '/login';
  }

  return `/${locale}/login`;
};

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const tProfile = useTranslations('profile');
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();

  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
  const loginPath = getLocaleLoginPath(locale);

  const email = useMemo(() => (searchParams.get('email') || '').trim(), [searchParams]);
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);
  const hasValidLink = Boolean(email && token);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!hasValidLink) {
      setError(t('invalidResetLink'));
      return;
    }

    if (!newPassword) {
      setError(tProfile('pleaseEnterNewPassword'));
      return;
    }

    if (newPassword.length < 6) {
      setError(tProfile('newPasswordMinLength'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(tProfile('passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPasswordAction({
        email,
        token,
        newPassword,
        confirmNewPassword,
      });

      if (!result.success) {
        setError(result.message || t('resetPasswordFailed'));
        return;
      }

      const successMessage = result.message || t('resetPasswordSuccess');
      setMessage(successMessage);
      toast.success(successMessage);

      setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(loginPath);
        }, 800);
      }, 1500);
    } catch (submitError) {
      console.error('Reset password error:', submitError);
      setError(t('resetPasswordError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen items-center justify-center bg-orange-50 px-4"
    >
      {isRedirecting ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-orange-50/90"
        >
          <div className="text-center">
            <LoadingOverlay />
            <p className="mt-4 font-medium text-orange-600">{t('redirectingToLogin')}</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
        >
          <h1 className="text-center text-2xl font-bold text-orange-500">{t('resetPasswordTitle')}</h1>
          <p className="mt-2 text-center text-sm text-gray-600">{t('resetPasswordSubtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('email')}</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 pr-10 text-gray-600 outline-none"
              />
              <MailOutline className="absolute right-3 top-10 text-gray-400" />
            </div>

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">{tProfile('newPassword')}</label>
              <input
                type={isNewPasswordVisible ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 pr-10 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                placeholder={tProfile('newPassword')}
                disabled={!hasValidLink || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setIsNewPasswordVisible((value) => !value)}
                className="absolute right-3 top-10 text-gray-500"
                tabIndex={-1}
              >
                {isNewPasswordVisible ? <LockOpen className="h-5 w-5" /> : <LockOutline className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">{tProfile('confirmNewPassword')}</label>
              <input
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 pr-10 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                placeholder={tProfile('confirmNewPassword')}
                disabled={!hasValidLink || isSubmitting}
              />
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible((value) => !value)}
                className="absolute right-3 top-10 text-gray-500"
                tabIndex={-1}
              >
                {isConfirmPasswordVisible ? <LockOpen className="h-5 w-5" /> : <LockOutline className="h-5 w-5" />}
              </button>
            </div>

            {!hasValidLink && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {t('invalidResetLink')}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!hasValidLink || isSubmitting}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t('resettingPassword') : t('resetPassword')}
            </button>

            <button
              type="button"
              onClick={() => router.push(loginPath)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {t('backToLogin')}
            </button>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOutline } from '@mui/icons-material';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import {
  confirmEmailAction,
  resendVerificationEmailAction,
} from '@/app/actions/emailVerificationAction';

const getLocaleLoginPath = (locale?: string): string => {
  if (!locale) {
    return '/login';
  }

  return `/${locale}/login`;
};

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();

  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
  const loginPath = getLocaleLoginPath(locale);

  const email = useMemo(() => (searchParams.get('email') || '').trim(), [searchParams]);
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

  const [message, setMessage] = useState('Đang xác thực email...');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [resendEmail, setResendEmail] = useState(email);
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyEmail = async () => {
      if (!email || !token) {
        if (!mounted) {
          return;
        }

        setMessage('Liên kết xác thực không hợp lệ hoặc đã thiếu thông tin. Vui lòng nhập email để gửi lại.');
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      const result = await confirmEmailAction(email, token);

      if (!mounted) {
        return;
      }

      setMessage(result.message);
      setIsSuccess(result.success);
      setIsLoading(false);

      if (result.success) {
        setTimeout(() => {
          if (!mounted) {
            return;
          }

          setIsRedirecting(true);
          setTimeout(() => {
            router.push(loginPath);
          }, 800);
        }, 2000);
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, [email, token, router, loginPath]);

  const handleResendToken = async () => {
    if (!resendEmail.trim()) {
      setResendMessage('Vui lòng nhập email.');
      return;
    }

    setIsResending(true);
    const response = await resendVerificationEmailAction(resendEmail.trim());
    setResendMessage(response.message);
    setIsResending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center min-h-screen bg-orange-50"
    >
      <AnimatePresence mode="wait">
        {isRedirecting ? (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-orange-50 bg-opacity-90 z-50"
          >
            <div className="text-center">
              <LoadingOverlay />
              <p className="mt-4 text-orange-600 font-medium">Đang chuyển đến trang đăng nhập...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Xác thực Email</h2>

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <LoadingOverlay />
                <p className="mt-4 text-gray-600 text-center">{message}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-lg ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex flex-col items-center">
                  {isSuccess ? (
                    <svg
                      className="w-12 h-12 text-green-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12 text-red-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}

                  <p className={`text-center ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>{message}</p>

                  {!isSuccess && (
                    <div className="mt-4 w-full">
                      <div className="relative">
                        <input
                          type="email"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Nhập email để nhận lại link xác thực"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                        />
                        <MailOutline className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      </div>

                      <button
                        className="mt-3 w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                        onClick={handleResendToken}
                        disabled={isResending}
                      >
                        {isResending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                      </button>

                      {resendMessage && (
                        <p className="text-sm text-center mt-2 text-red-600">{resendMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

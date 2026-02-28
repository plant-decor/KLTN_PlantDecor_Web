'use client';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface RecaptchaFieldProps {
  onToken: (token: string) => void;
  onError?: (error: string) => void;
  showMessage?: boolean;
  isLoading?: boolean;
}

export default function RecaptchaField({
  onToken,
  onError,
  showMessage = true,
  isLoading = false,
}: RecaptchaFieldProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const handleRecaptcha = async () => {
      if (!executeRecaptcha) {
        console.warn('reCAPTCHA not ready yet');
        return;
      }

      setIsExecuting(true);
      try {
        const token = await executeRecaptcha('login');
        onToken(token);
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        const errorMessage = error instanceof Error ? error.message : 'reCAPTCHA verification failed';
        onError?.(errorMessage);
      } finally {
        setIsExecuting(false);
      }
    };

    if (executeRecaptcha && !isLoading) {
      handleRecaptcha();
    }
  }, [executeRecaptcha, isLoading, onToken, onError]);

  if (isExecuting || isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <LoadingSpinner />
          <span>Verifying with reCAPTCHA...</span>
        </div>
      </div>
    );
  }

  if (showMessage) {
    return (
      <div className="text-xs text-gray-500 text-center py-2">
        This site is protected by reCAPTCHA and the Google
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mx-1">
          Privacy Policy
        </a>
        and
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mx-1">
          Terms of Service
        </a>
        apply.
      </div>
    );
  }

  return null;
}

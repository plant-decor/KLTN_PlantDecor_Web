'use client';

import { useMemo, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [error, setError] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const siteKey = useMemo(
    () => process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    []
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
        <p className="text-red-700 text-xs">
          <strong>reCAPTCHA Setup Error:</strong> {error}
        </p>
        <p className="text-red-600 text-xs mt-2">
          Please add these to your <code className="bg-red-100 px-1 rounded">.env.local</code>:
        </p>
        <code className="text-red-600 text-xs block mt-1 bg-red-100 p-2 rounded break-words">
          NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_key
          <br />
          RECAPTCHA_SECRET_KEY=your_secret
        </code>
        <a 
          href="https://www.google.com/recaptcha/admin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 text-xs hover:underline mt-2 inline-block"
        >
          Get keys from Google reCAPTCHA
        </a>
      </div>
    );
  }

  if (!siteKey) {
    return (
      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
        <p className="text-red-700 text-xs">
          <strong>reCAPTCHA Setup Error:</strong> NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey={siteKey}
          onChange={(token: string | null) => {
            if (token) {
              setError('');
              setIsVerified(true);
              onToken(token);
              return;
            }
            setIsVerified(false);
            onToken('');
          }}
          onErrored={() => {
            const message = 'reCAPTCHA failed to load. Please refresh and try again.';
            setIsVerified(false);
            setError(message);
            onError?.(message);
          }}
          onExpired={() => {
            setIsVerified(false);
            onToken('');
          }}
        />
      </div>

      {isVerified && (
        <div className="text-green-700 text-xs text-center">reCAPTCHA verified.</div>
      )}

      {showMessage && (
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
      )}
    </div>
  );
}

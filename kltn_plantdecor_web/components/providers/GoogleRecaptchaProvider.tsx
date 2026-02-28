'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import type { ReactNode } from 'react';

interface GoogleRecaptchaProviderProps {
  children: ReactNode;
}

export function GoogleRecaptchaProviderWrapper({
  children,
}: GoogleRecaptchaProviderProps) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!reCaptchaKey) {
    console.warn(
      'NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. reCAPTCHA will not be functional.'
    );
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}

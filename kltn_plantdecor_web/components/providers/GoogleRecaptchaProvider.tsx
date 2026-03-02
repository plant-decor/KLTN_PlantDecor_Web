'use client';

import type { ReactNode } from 'react';

interface GoogleRecaptchaProviderProps {
  children: ReactNode;
}

export function GoogleRecaptchaProviderWrapper({
  children,
}: GoogleRecaptchaProviderProps) {
  return <>{children}</>;
}

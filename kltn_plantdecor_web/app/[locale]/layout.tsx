import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { type ReactNode } from 'react';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/components/providers/AuthProviderNew';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plant Decor',
  description: 'Elevate your living space with AI-powered plant care.',
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — render 404 if invalid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <LoadingOverlay />
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

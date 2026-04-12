import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { SessionInvalidatedModal } from "@/components/auth/SessionInvalidatedModal";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

export const metadata: Metadata = {
  title: {
    default: "PlantDecor – Thiết kế không gian xanh & Cây cảnh thông minh với AI",
    template: "%s | PlantDecor",
  },
  description:
    "Nền tảng tích hợp thương mại điện tử, tư vấn thiết kế nội thất xanh bằng AI và dịch vụ chăm sóc cây chuyên nghiệp.",
  keywords: [
    "cây cảnh nội thất",
    "thiết kế không gian xanh AI",
    "tư vấn phong thủy cây cảnh",
    "chăm sóc cây tại nhà",
    "PlantDecor",
    "mua cây online",
  ],
  openGraph: {
    type: "website",
    siteName: "PlantDecor",
    title: "PlantDecor – Thiết kế không gian xanh & Cây cảnh thông minh với AI",
    description:
      "Nền tảng tích hợp thương mại điện tử, tư vấn thiết kế nội thất xanh bằng AI và dịch vụ chăm sóc cây chuyên nghiệp.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "PlantDecor - Thiết kế không gian xanh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlantDecor – Thiết kế không gian xanh & Cây cảnh thông minh với AI",
    description:
      "Nền tảng tích hợp thương mại điện tử, tư vấn thiết kế nội thất xanh bằng AI và dịch vụ chăm sóc cây chuyên nghiệp.",
    images: [DEFAULT_OG_IMAGE],
  },
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — render 404 if invalid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();
  const initialUser = await getCurrentUser();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider initialUser={initialUser}>
        <ToastProvider />
        <LoadingOverlay />
        <SessionInvalidatedModal />
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

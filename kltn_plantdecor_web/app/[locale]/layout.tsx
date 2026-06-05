import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { ChatNotificationProvider } from "@/components/providers/ChatNotificationProvider";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { SessionInvalidatedModal } from "@/components/auth/SessionInvalidatedModal";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";


export const metadata: Metadata = {
  title: {
    default: "PlantDecor – Green Space Design & Smart Plant Solutions with AI",
    template: "%s | PlantDecor",
  },
  description:
    "An integrated e-commerce platform with AI-powered green interior design consultation and professional plant care services.",
  keywords: [
    "decorative plants",
    "green space design AI",
    "plant feng shui consultation",
    "at-home plant care",
    "PlantDecor",
    "buy plants online",
  ],
  openGraph: {
    type: "website",
    siteName: "PlantDecor",
    title: "PlantDecor – Green Space Design & Smart Plant Solutions with AI",
    description:
      "An integrated e-commerce platform with AI-powered green interior design consultation and professional plant care services.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "PlantDecor - Green Space Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlantDecor – Green Space Design & Smart Plant Solutions with AI",
    description:
      "An integrated e-commerce platform with AI-powered green interior design consultation and professional plant care services.",
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
        <ChatNotificationProvider />
        <LoadingOverlay />
        <SessionInvalidatedModal />
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

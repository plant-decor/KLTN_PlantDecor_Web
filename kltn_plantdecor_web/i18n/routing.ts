import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['vi', 'en'],

  // Default locale (English)
  defaultLocale: 'en',

  // Always serve default locale on / instead of using browser language detection.
  localeDetection: false,

  // Locale prefix strategy:
  // 'as-needed' = default locale has no prefix (e.g. /products, /en/products)
  localePrefix: 'as-needed',
});

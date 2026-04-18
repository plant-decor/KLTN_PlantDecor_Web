import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['vi', 'en'],

  // Default locale (English)
  defaultLocale: 'en',

  // Locale prefix strategy:
  // 'as-needed' = default locale has no prefix (e.g. /products, /en/products)
  localePrefix: 'as-needed',
});

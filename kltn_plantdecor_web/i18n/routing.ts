import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['vi', 'en'],

  // Default locale (Vietnamese)
  defaultLocale: 'vi',

  // Locale prefix strategy:
  // 'as-needed' = default locale has no prefix (e.g. /products, /en/products)
  localePrefix: 'as-needed',
});

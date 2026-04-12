import type { MetadataRoute } from 'next';

type Locale = 'vi' | 'en';

const locales: Locale[] = ['vi', 'en'];

const publicRoutes = ['', '/about', '/contact', '/plant-store', '/checkout'];

const getBaseUrl = (): string => {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    'https://www.plantdecor.io.vn';

  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};

const toLocalizedPath = (locale: Locale, path: string): string => {
  if (locale === 'vi') {
    return path || '/';
  }

  return path ? `/${locale}${path}` : `/${locale}`;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  return locales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: `${baseUrl}${toLocalizedPath(locale, route)}`,
      lastModified: now,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1 : 0.8,
    }))
  );
}

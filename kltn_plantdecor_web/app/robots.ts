import type { MetadataRoute } from 'next';

const getBaseUrl = (): string => {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    'https://www.plantdecor.io.vn';

  return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/manager',
          '/staff',
          '/consultant',
          '/shipper',
          '/caretaker',
          '/user',
          '/dashboard',
          '/api',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

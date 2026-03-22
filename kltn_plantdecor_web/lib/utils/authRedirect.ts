import { routing } from '@/i18n/routing';
import { getDefaultPath } from '@/lib/utils/roleHelper';

interface ResolvePostLoginRedirectParams {
  redirectToRaw: string | null;
  userId?: number;
  userRole?: string;
  pathname: string;
}

const resolveLocaleFromPathname = (pathname: string): string => {
  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  return routing.locales.includes(firstSegment as 'vi' | 'en')
    ? firstSegment
    : routing.defaultLocale;
};

const withLocalePrefix = (path: string, locale: string): string => {
  if (!path.startsWith('/')) {
    return path;
  }

  if (locale === routing.defaultLocale) {
    return path;
  }

  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
    return path;
  }

  return `/${locale}${path}`;
};

export const resolvePostLoginRedirect = ({
  redirectToRaw,
  userId,
  userRole,
  pathname,
}: ResolvePostLoginRedirectParams): string => {
  const locale = resolveLocaleFromPathname(pathname);

  const basePath =
    redirectToRaw && redirectToRaw.startsWith('/')
      ? redirectToRaw
      : withLocalePrefix(getDefaultPath(userRole), locale);

  return userId
    ? basePath.replace(/\[(userid|userId)\]/g, String(userId))
    : basePath;
};

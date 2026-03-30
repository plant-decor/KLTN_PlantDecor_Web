'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

/**
 * LanguageSwitcher Component
 *
 * Toggles between Vietnamese (vi) and English (en).
 * Uses next-intl navigation helpers so locale prefix is handled automatically.
 *
 * Usage:
 *   <LanguageSwitcher />
 */

export default function LanguageSwitcher() {
  // Fallback: lấy locale từ useLocale, nếu không có thì lấy từ cookie, nếu vẫn không có thì dùng 'vi'
  let locale = useLocale();
  if (!locale || (locale !== 'vi' && locale !== 'en')) {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
      const cookieLocale = match ? decodeURIComponent(match[1]) : '';
      if (cookieLocale === 'vi' || cookieLocale === 'en') {
        locale = cookieLocale;
      } else {
        locale = 'vi';
      }
    } else {
      locale = 'vi';
    }
  }

  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('language');

  const handleLocaleChange = (nextLocale: string) => {
    // Khi đổi ngôn ngữ, cập nhật cookie locale
    if (typeof document !== 'undefined') {
      document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
    }
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 overflow-hidden text-sm">
      <button
        onClick={() => handleLocaleChange('vi')}
        disabled={isPending || locale === 'vi'}
        className={`
          px-3 py-1.5 font-medium transition-colors duration-150
          ${locale === 'vi'
            ? 'bg-green-600 text-white cursor-default'
            : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
          ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={t('vi')}
        aria-label={`${t('switchTo')} ${t('vi')}`}
      >
        🇻🇳 VI
      </button>

      <button
        onClick={() => handleLocaleChange('en')}
        disabled={isPending || locale === 'en'}
        className={`
          px-3 py-1.5 font-medium transition-colors duration-150
          ${locale === 'en'
            ? 'bg-green-600 text-white cursor-default'
            : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
          ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={t('en')}
        aria-label={`${t('switchTo')} ${t('en')}`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}

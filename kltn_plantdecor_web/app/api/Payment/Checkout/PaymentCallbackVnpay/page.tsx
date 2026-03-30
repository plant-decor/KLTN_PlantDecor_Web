
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';

interface PaymentCallbackBridgePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toQueryString(params: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      continue;
    }
    if (typeof value === 'string') {
      query.set(key, value);
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export default async function PaymentCallbackBridgePage({
  searchParams,
}: PaymentCallbackBridgePageProps) {
  const query = await searchParams;
  // Lấy locale từ cookie, nếu không có thì dùng defaultLocale
  let locale: 'vi' | 'en' = routing.defaultLocale;
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('locale')?.value;
    if (cookieLocale && routing.locales.includes(cookieLocale as any) && (cookieLocale === 'en' || cookieLocale === 'vi')) {
      locale = cookieLocale as 'vi' | 'en';
    }
  } catch (e) {
    // fallback giữ nguyên defaultLocale
  }

  // Luôn redirect về 1 trang duy nhất, dùng i18n để hiển thị nội dung phù hợp
  const resultPath = `/${locale}/checkout/result`;
  redirect(resultPath);
  return null;
}

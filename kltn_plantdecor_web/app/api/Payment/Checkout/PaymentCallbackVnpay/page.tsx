import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';

interface PaymentCallbackBridgePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildLocalizedPath(locale: 'vi' | 'en', path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export default async function PaymentCallbackBridgePage({
  searchParams,
}: PaymentCallbackBridgePageProps) {
  const query = await searchParams;

  let locale: 'vi' | 'en' = routing.defaultLocale;
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('locale')?.value;
    if (
      cookieLocale &&
      routing.locales.includes(cookieLocale as never) &&
      (cookieLocale === 'en' || cookieLocale === 'vi')
    ) {
      locale = cookieLocale as 'vi' | 'en';
    }
  } catch {
    // Keep default locale
  }

  const isSuccess =
    query.vnp_ResponseCode === '00' &&
    (query.vnp_TransactionStatus === '00' || query.vnp_TransactionStatus === undefined);
  const result = isSuccess ? 'success' : 'fail';

  const resultPath = buildLocalizedPath(locale, `/checkout/result/${result}`);
  redirect(resultPath);
}

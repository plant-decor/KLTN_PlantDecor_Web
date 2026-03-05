import Error404Content from '@/components/errors/Error404Content';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const homeHref = locale === 'en' ? '/en' : '/';
  const t = await getTranslations('notFound');

  return (
    <Error404Content
      homeHref={homeHref}
      title={t('title')}
      description={t('description')}
      buttonLabel={t('backHome')}
      imageAlt={t('imageAlt')}
    />
  );
}

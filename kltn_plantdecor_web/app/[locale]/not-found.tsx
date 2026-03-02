import Error404Content from '@/components/errors/Error404Content';
import { getTranslations } from 'next-intl/server';

interface LocaleNotFoundProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleNotFound({ params }: LocaleNotFoundProps) {
  const { locale } = await params;
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

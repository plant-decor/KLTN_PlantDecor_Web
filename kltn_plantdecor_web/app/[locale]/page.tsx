import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import MainLayout from '@/components/layout/MainLayout';
// import { SAMPLE_PLANTS } from '@/data/sampledata';
import ProductCard from '@/components/product/ProductCard';
import ExpertGuide from '@/components/public/ExpertGuide';
import SupportChatWidget from '@/components/chat/SupportChatWidget';
import { ContactSupportOutlined, LocalFloristOutlined, SmartToyOutlined } from '@mui/icons-material';
import Image from 'next/image';

export default function Home() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  // const featuredPlants = SAMPLE_PLANTS.filter(
  //   (plant) => plant.isFeatured || plant.isBestSeller
  // ).slice(0, 8);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-linear-to-r from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('heroTitle')}{' '}
                <span className="text-green-600">{t('heroTitleHighlight')}</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                {t('heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/ai-plant-recommendation"
                  className="bg-[#20DF20] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  {t('exploreAIDesignNow')}
                </Link>
                <Link
                  href="/plant-store"
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 hover:text-white transition-colors text-center"
                >
                  {t('startShopping')}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(1).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(2).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(5).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(4).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />  
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(3).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src="/img/landingPageImage(6).jpg"
                      alt="Chăm sóc cây xanh"
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('whyChooseUs')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <SmartToyOutlined sx={{fontSize: 40}} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('aiTechnology')}</h3>
              <p className="text-gray-600">{t('aiTechnologyDesc')}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <ContactSupportOutlined sx={{fontSize: 40}} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('expertCare')}</h3>
              <p className="text-gray-600">{t('expertCareDesc')}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <LocalFloristOutlined sx={{fontSize: 40}} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('qualityPlants')}</h3>
              <p className="text-gray-600">{t('qualityPlantsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t('featuredTitle')}
              </h2>
              <p className="text-xl text-gray-600">{t('featuredSubtitle')}</p>
            </div>
            <Link
              href="/plant-store"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center"
            >
              {t('viewAllPlants')}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* {featuredPlants.map((plant) => (
              <ProductCard key={plant.id} plant={plant} />
            ))} */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-green-100 mb-8">{t('ctaSubtitle')}</p>
          <Link
            href="/services"
            className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors inline-block"
          >
            {t('startNow')}
          </Link>
        </div> */}
        <ExpertGuide/>
      </section>
      <SupportChatWidget />
    </MainLayout>
  );
}

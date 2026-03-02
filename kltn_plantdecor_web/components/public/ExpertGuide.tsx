import React from 'react';
import { WaterDropOutlined , Sunny, BugReport, GrassOutlined } from '@mui/icons-material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const ExpertGuide = () => {
  const t = useTranslations('expertGuide');

  // Dữ liệu cho các thẻ dịch vụ để mã nguồn gọn gàng hơn
  const services = [
    {
      icon: <WaterDropOutlined className="text-green-500"  />,
      title: t('watering.title'),
      desc: t('watering.desc')
    },
    {
      icon: <Sunny className="text-green-500"/>,
      title: t('sunlight.title'),
      desc: t('sunlight.desc')
    },
    {
      icon: <BugReport className="text-green-500"  />,
      title: t('pestControl.title'),
      desc: t('pestControl.desc')
    },
    {
      icon: <GrassOutlined className="text-green-500"  />,
      title: t('fertilizer.title'),
      desc: t('fertilizer.desc')
    }
  ];

  return (
    <section className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-3xl overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        
        {/* Khối nội dung bên trái */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('title')}
            </h2>
            <p className="text-gray-500 max-w-md">
              {t('subtitle')}
            </p>
          </div>

          {/* Lưới các thẻ tính năng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-green-50 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối hình ảnh bên phải */}
        <div className="flex-1 w-full">
          <div className="relative aspect-[16/9] lg:aspect-square xl:aspect-[16/10] bg-[#a3b899] rounded-3xl flex items-center justify-center overflow-hidden">
             {/* Thay thế 'src' bằng đường dẫn ảnh thực tế của bạn */}
            <Image 
              src="/img/imageExpertGuideLandingPage.png" 
              alt={t('imageAlt')}
              width={1920}
              height={1080}
              className="object-cover w-full h-full mix-blend-multiply opacity-80"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default ExpertGuide;
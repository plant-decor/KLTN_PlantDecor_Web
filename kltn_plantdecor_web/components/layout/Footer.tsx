'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Facebook as FacebookIcon,
  X as XIcon,
  Pinterest as PinterestIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import axiosInstance from '@/lib/api/axiosInstance';

export default function Footer() {
  const t = useTranslations('footer');
  const [isTestingLoading, setIsTestingLoading] = useState(false);

  const handleTestLoading = async () => {
    try {
      setIsTestingLoading(true);
      const mockDelayUrl = `${window.location.origin}/api/mock-delay`;
      await axiosInstance.get(mockDelayUrl);
    } catch (error) {
      console.error('Loading test failed:', error);
    } finally {
      setIsTestingLoading(false);
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">Plant Decor</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                <FacebookIcon sx={{ fontSize: 20 }} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                <XIcon sx={{ fontSize: 20 }} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                <PinterestIcon sx={{ fontSize: 20 }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('customerSupport')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('returnPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <LocationOnIcon sx={{ fontSize: 20, color: '#16a34a', marginTop: '2px' }} />
                <p className="text-gray-400 text-sm">{t('address')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                <p className="text-gray-400 text-sm">{t('phone')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <EmailIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                <p className="text-gray-400 text-sm">{t('email')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2026 Plant Decor. {t('rights')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-green-600 text-sm transition-colors duration-200">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-600 text-sm transition-colors duration-200">
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleTestLoading}
            disabled={isTestingLoading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTestingLoading ? 'Đang test loading...' : 'Test Loading 5s'}
          </button>
        </div>
      </div>
    </footer>
  );
}
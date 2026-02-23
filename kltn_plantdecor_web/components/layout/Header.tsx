'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Plant Decor</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Sản phẩm
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Dịch vụ
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Về chúng tôi
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Liên hệ
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="/login" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Đăng ký
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Trang chủ
              </Link>
              <Link href="/products" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Sản phẩm
              </Link>
              <Link href="/services" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Dịch vụ
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Về chúng tôi
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                Liên hệ
              </Link>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                  Đăng nhập
                </Link>
                <Link href="/register" className="block px-3 py-2 text-green-600 font-medium">
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
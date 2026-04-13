import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import { Metadata } from 'next';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Root layout - provides the required <html> and <body> shell.
 * Locale-specific providers live in app/[locale]/layout.tsx.
 * suppressHydrationWarning prevents hydration mismatch when the
 * locale layout sets attributes (e.g. lang) at runtime.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://www.plantdecor.io.vn'), // Cần thiết cho sitemap và SEO
  title: {
    default: 'Plant Decor',
    template: '%s | Plant Decor' // Giúp các trang con tự động có đuôi | Plant Decor
  },
  description: 'Khám phá thế giới cây cảnh với công nghệ AI hiện đại. Chúng tôi giúp bạn tạo ra không gian sống xanh, thông minh và tràn đầy sức sống.',
  icons: {
    icon: [
      { url: '/favicon.ico' }, // Icon mặc định
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }, // Icon chất lượng cao (upscaled)
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

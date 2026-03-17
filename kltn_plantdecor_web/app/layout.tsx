import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';

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

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plant Decor - Nâng tầm không gian sống với AI",
  description: "Khám phá thế giới cây cảnh với công nghệ AI hiện đại. Chúng tôi giúp bạn tạo ra không gian sống xanh, thông minh và tràn đầy sức sống.",
  keywords: "cây cảnh, AI, không gian xanh, thiết kế nội thất, chăm sóc cây",
  authors: [{ name: "Plant Decor Team" }],
  openGraph: {
    title: "Plant Decor - Nâng tầm không gian sống với AI",
    description: "Khám phá thế giới cây cảnh với công nghệ AI hiện đại",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: ['localhost:3000', 'localhost:7180'],
    },
  },
  // Increase server-side fetch timeout
  serverExternalPackages: ['@node-rs/argon2'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent konva/react-konva from being bundled on server
      config.externals = config.externals || {};
      config.externals['konva'] = 'konva';
      config.externals['react-konva'] = 'react-konva';
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

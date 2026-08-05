import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.100'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', '@radix-ui/react-switch', 'recharts', 'date-fns'],
  },
};

export default withAnalyzer(nextConfig);

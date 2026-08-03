import type { NextConfig } from 'next';

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
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', '@radix-ui/react-switch'],
  },
};

export default nextConfig;

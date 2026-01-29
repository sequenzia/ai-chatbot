import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is enabled by default in Next.js 15+ when using `next dev --turbopack`
  allowedDevOrigins: [
    '*',
  ], 
};

export default nextConfig;

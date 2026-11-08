import type { NextConfig } from 'next';

const isProduction = process.env.SITE_ENV === 'production';

const config: NextConfig = {
  output: 'standalone',
  // Same URLs as WordPress: every path ends with a slash.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@banovit/ui', '@banovit/api-client'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 960, 1280],
    imageSizes: [160, 240],
    remotePatterns: [
      { protocol: 'https', hostname: 'banovit.com' },
      { protocol: 'https', hostname: '*.banovit.com' },
    ],
  },
  async headers() {
    // Until cutover every non-production deploy (new.banovit.com on stage2)
    // must stay out of search engines: header here + meta in layout + robots.txt.
    return isProduction ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default config;

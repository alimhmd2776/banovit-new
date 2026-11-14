import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { BottomNav } from '@/components/layout/BottomNav';
import { NavigationProgress } from '@/components/loading/NavigationProgress';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { TrackingRoot } from '@/components/tracking/TrackingRoot';
import { getTrackingSettings } from '@/lib/api';
import { env } from '@/lib/env';
import '@/styles/globals.css';

const vazirmatn = localFont({
  src: './fonts/Vazirmatn-wght.woff2',
  variable: '--font-vazirmatn',
  weight: '100 900',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.canonicalOrigin),
  title: { default: 'بانویت', template: '%s - بانویت' },
  // Non-production deploys are never indexed (pages may still set stricter robots).
  robots: env.isProduction ? undefined : { index: false, follow: false },
  // Original live site icons (WP site_icon), added under public/brand/.
  icons: {
    icon: [
      { url: '/brand/site-icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/site-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/brand/site-icon-180x180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f6fad',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tracking = await getTrackingSettings();
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-dvh">
        {/* first: configures Ads / dataLayer before page components push events */}
        <TrackingRoot settings={tracking} />
        <NavigationProgress />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-modal focus:rounded-sm focus:bg-surface focus:p-2">
          رفتن به محتوای اصلی
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}

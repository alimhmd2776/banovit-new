import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { BottomNav } from '@/components/layout/BottomNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f6fad',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-dvh">
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

// src/app/layout.tsx
import type { Metadata } from 'next';
import { cache } from 'react';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { getGlobalConfig } from '@/lib/api';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import SharedCanvas from '@/components/ui/SharedCanvas';

// Deduplicate getGlobalConfig across generateMetadata + RootLayout
const getCachedGlobalConfig = cache(() => getGlobalConfig());

// Tipografía IBM Plex Sans según el diseño
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getCachedGlobalConfig();

  const faviconUrl = global?.favicon ? getStrapiImageUrl(global.favicon) : '/favicon.ico';

  return {
    title: 'Bryan Torres',
    description: 'Professional Photography Portfolio',
    icons: {
      icon: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getCachedGlobalConfig();

  return (
    <html lang="es" className={ibmPlexSans.variable}>
      <body className="bg-white text-white antialiased">
        <SharedCanvas>
          <main>{children}</main>
        </SharedCanvas>
      </body>
    </html>
  );
}

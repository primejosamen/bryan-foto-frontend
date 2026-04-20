// src/app/layout.tsx
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { getGlobalConfig } from '@/lib/api';

// Tipografía IBM Plex Sans según el diseño
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalConfig();
  
  return {
    title: global?.siteName || 'Bryan Torres',
    description: global?.siteDescription || 'Professional Photography Portfolio',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getGlobalConfig();

  return (
    <html lang="es" className={ibmPlexSans.variable}>
      <body className="bg-white text-white antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}

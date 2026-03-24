/**
 * Navigation link component used in the home page.
 * Renders a white text link with a red pill background.
 *
 * @component
 */
'use client';

import Link from 'next/link';
import { COLORS, FONT_FAMILY } from '@/config/constants';

interface HomeNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function HomeNavLink({ href, children }: HomeNavLinkProps) {
  return (
    <Link
      href={href}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: FONT_FAMILY,
        fontSize: 16,
        fontWeight: 600,
        color: COLORS.white,
      }}
    >
      {/* RED PILL BACKGROUND */}
      <span
        style={{
          position: 'absolute',
          left: -12,
          right: -12,
          top: -8,
          bottom: -8,
          background: COLORS.accent,
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color: COLORS.white }}>{children}</span>
    </Link>
  );
}

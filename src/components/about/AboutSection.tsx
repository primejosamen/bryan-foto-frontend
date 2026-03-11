/**
 * About page section with split layout.
 * Left: dark background with fix2.glb 3D glass logo.
 * Right: white background with About title and body text.
 * Red navigation bar with About/Contact text directly on it.
 *
 * @component
 */
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { About } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import LogoAbout3D from '@/components/ui/LogoAbout3D';
import { COLORS, FONT_FAMILY, FONT_SIZES } from '@/config/constants';
import { ROUTES } from '@/config/navigation';

//#region Constants

/** Layout dimensions from the design pixel spec */
const LAYOUT = {
  navTop: 140.58,
  contentTop: 300,
} as const;

/** Nav links for internal pages */
const PAGE_NAV_LINKS = [
  { href: ROUTES.about, label: 'About' },
  { href: ROUTES.contact, label: 'Contact' },
] as const;

//#endregion Constants

//#region Types

interface AboutSectionProps {
  about: About | null;
}

//#endregion Types

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AboutSection({ about }: AboutSectionProps) {
  const pathname = usePathname();

  if (!about) return null;

  //#region Content extraction
  const richTextBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.rich-text') || [];

  const quoteBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.quote') || [];

  const mediaBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.media') || [];
  //#endregion Content extraction

  return (
    <section className="relative min-h-screen">

      {/* ── SPLIT BACKGROUND (fixed, z-0) ── */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <div className="flex h-full">
          <div className="w-1/2" style={{ background: '#000000' }} />
          <div className="w-1/2" style={{ background: '#ffffff' }} />
        </div>
      </div>

      {/* ── 3D LOGO ── */}
      <LogoAbout3D />

      {/* ── RED BAR WITH NAV LINKS ON IT (fixed, z-10) ── */}
      <div
        style={{
          position: 'fixed',
          top: `${LAYOUT.navTop}px`,
          left: 0,
          right: 0,
          zIndex: 10,
          height: 'auto',
        }}
      >
        {/* RED BAR — the bar IS the nav, links sit on it */}
        <div
          style={{
            background: COLORS.accent,
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            paddingLeft: '603.2px',
          }}
        >
          {PAGE_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: FONT_FAMILY,
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.white,
                  padding: '2px 20px',
                  opacity: isActive ? 1 : 0.7,
                  textDecoration: 'none',
                  borderBottom: isActive ? '3px solid white' : '3px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT LAYER (relative, z-5) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        {/* LEFT COLUMN — empty, logo renders behind */}
        <div style={{ width: '50%' }} />

        {/* RIGHT COLUMN — About content on white */}
        <div
          style={{
            width: '50%',
            paddingTop: `${LAYOUT.contentTop}px`,
            paddingLeft: 'clamp(8rem, 12vw, 12rem)',
            paddingRight: 'clamp(2rem, 4vw, 4rem)',
            paddingBottom: '4rem',
            color: '#000000',
            pointerEvents: 'auto',
          }}
        >
          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: FONT_SIZES.title,
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: '-1.5rem',
              marginLeft: '-10.5rem',
            }}
          >
            {about.title}
          </motion.h1>

          {/* RICH TEXT BLOCKS */}
          {richTextBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: FONT_SIZES.body,
                lineHeight: 1.6,
                fontWeight: 300,
                marginBottom: '2rem',
              }}
            >
              {block.body}
            </motion.div>
          ))}

          {/* QUOTE BLOCKS */}
          {quoteBlocks.map((block, index) => (
            <motion.blockquote
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              style={{
                borderLeft: '2px solid rgba(0, 0, 0, 0.2)',
                paddingLeft: '1.5rem',
                marginTop: '2rem',
                marginBottom: '2rem',
                fontStyle: 'italic',
                fontFamily: FONT_FAMILY,
                fontSize: '20px',
                lineHeight: 1.8,
              }}
            >
              {block.title && (
                <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                  {block.title}
                </p>
              )}
              {block.body && (
                <p style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{block.body}</p>
              )}
            </motion.blockquote>
          ))}

          {/* MEDIA BLOCKS */}
          {mediaBlocks.map((block) =>
            block.file ? (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ aspectRatio: '4/5', position: 'relative', marginBottom: '2rem' }}
              >
                <Image
                  src={getStrapiImageUrl(block.file)}
                  alt="About image"
                  fill
                  className="object-cover"
                />
              </motion.div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}

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
import type { About } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import LogoAbout3D from '@/components/ui/LogoAbout3D';
import NavFooter from '@/components/layout/NavFooter';

//#region Types

interface AboutSectionProps {
  about: About | null;
}

//#endregion Types

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AboutSection({ about }: AboutSectionProps) {

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
    <section className="relative h-auto md:h-screen overflow-auto md:overflow-hidden">

      {/* ── BACKGROUND (fixed, z-0) ── */}
      <div className="fixed inset-0 z-0 bg-white" />

      {/* ── 3D LOGO ── */}
      <LogoAbout3D />

      {/* ── FOOTER NAV ── */}
      <NavFooter />

      {/* ── 4×4 GRID LAYOUT ── */}
      <div className="relative z-5 grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto_1fr] md:grid-rows-4 gap-2 min-h-screen md:h-screen pointer-events-none text-black p-6 md:p-0">

        {/* TÍTULO — mobile: top / desktop: row 2, col 3 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-start-1 md:col-start-3 row-start-1 md:row-start-2 self-end font-ibm-mono text-[clamp(1.5rem,2.5vw,32px)] italic font-bold leading-tight tracking-[-0.085em] pointer-events-auto pt-16 md:pt-0 bg-accent text-white px-2"
        >
          {about.title}
        </motion.h1>

        {/* RICH TEXT — mobile: below title / desktop: row 3-4, col 3-4 */}
        <div className="col-start-1 md:col-start-3 col-span-1 md:col-span-2 row-start-2 md:row-start-3 row-span-1 md:row-span-2 self-start flex flex-col gap-4 pr-0 md:pr-[clamp(2rem,4vw,4rem)] pt-4 pointer-events-auto overflow-hidden bg-accent text-white px-2">
          {richTextBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal tracking-[-0.05em]"
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
              className="border-l-2 border-black/20 pl-6 italic font-ibm-mono text-[clamp(0.8rem,1.1vw,1.3rem)] leading-snug font-bold-italic tracking-[-0.05em]"
            >
              {block.title && (
                <p className="font-bold-italic mb-2">{block.title}</p>
              )}
              {block.body && (
                <p className="text-black/60">{block.body}</p>
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
                className="relative aspect-[4/5]"
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

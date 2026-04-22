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
import type { About } from '@/models';
import type { ContactInfo } from '@/models';
import GlassNavBar from '@/components/ui/GlassNavBar';
import BackButton from '@/components/ui/BackButton';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';
import LogoAbout3D from '@/components/ui/LogoAbout3D';

//#region Types

interface AboutSectionProps {
  about: About | null;
  contacto: ContactInfo | null;
}

//#endregion Types

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AboutSection({ about, contacto }: AboutSectionProps) {

  if (!about) return null;

  //#region Content extraction
  const richTextBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.rich-text') || [];

  const quoteBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.quote') || [];

  const mediaBlocks =
    about.blocks?.filter((b) => b.__component === 'shared.media') || [];

  const contactItems = contacto
    ? [
        { key: 'phone', label: 'Phone', value: contacto.telefono, href: contacto.telefono ? `https://wa.me/${contacto.telefono.replace(/[^0-9]/g, '')}` : null },
        { key: 'email', label: 'Email', value: contacto.email, href: contacto.email ? `mailto:${contacto.email}` : null },
        { key: 'instagram', label: 'Instagram', value: contacto.instagram, href: contacto.instagram ? `https://instagram.com/${contacto.instagram.replace('@', '')}` : null },
        { key: 'location', label: 'Location', value: contacto.ubicacion, href: null },
      ].filter((item) => item.value)
    : [];
  //#endregion Content extraction

  return (
    <section className="relative h-auto min-h-screen overflow-auto">

      {/* ── BACKGROUND (fixed, z-0) ── */}
      <div className="fixed inset-0 z-0 bg-white" />

      {/* ── 3D LOGO ── */}
      <LogoAbout3D />

      {/* ── BACK BUTTON ── */}
      <BackButton />

      {/* ── LAYOUT ── */}
      <div className="relative z-5 grid grid-cols-1 md:grid-cols-4 gap-2 min-h-screen pointer-events-none text-black p-6 md:p-0">

        {/* TÍTULO */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-start-1 md:col-start-3 self-end font-ibm-mono text-[clamp(1.2rem,2vw,26px)] font-bold leading-tight tracking-[-0.085em] pointer-events-auto pt-16 md:pt-8 text-red-500 px-2"
        >
          {about.title}
        </motion.h1>

        {/* RICH TEXT — mobile: below title / desktop: row 3-4, col 3-4 */}
        <div className="col-start-1 md:col-start-3 col-span-1 md:col-span-2 self-start flex flex-col gap-4 pr-8 md:pr-[clamp(10rem,16vw,20rem)] pt-4 pointer-events-auto text-red-500 px-2">
          {richTextBlocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="font-ibm-mono text-[clamp(0.65rem,0.85vw,14px)] leading-relaxed font-normal tracking-[-0.05em] flex flex-col gap-4"
            >
              {block.body
                ?.split(/(?<=\.)\s+/)
                .reduce<string[][]>((acc, sentence, i) => {
                  const groupIndex = Math.floor(i / 2);
                  if (!acc[groupIndex]) acc[groupIndex] = [];
                  acc[groupIndex].push(sentence);
                  return acc;
                }, [])
                .map((group, i) => (
                  <p key={i}>{group.join(' ')}</p>
                ))}
            </motion.div>
          ))}

          {/* QUOTE BLOCKS */}
          {quoteBlocks.map((block, index) => (
            <motion.blockquote
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="border-l-2 border-black/20 pl-6 font-ibm-mono text-[clamp(0.8rem,1.1vw,1.3rem)] leading-snug font-bold tracking-[-0.05em]"
            >
              {block.title && (
                <p className="font-bold mb-2">{block.title}</p>
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
                className="relative aspect-4/5"
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

        {/* CONTACT INFO — below about content */}
        {contactItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="col-start-1 md:col-start-3 col-span-1 md:col-span-2 self-start pt-6 pr-0 md:pr-[clamp(2rem,4vw,4rem)] pointer-events-auto text-red-500 px-2"
          >
            <h2 className="font-ibm-mono text-[clamp(1.5rem,2.5vw,32px)] font-bold leading-tight tracking-[-0.085em] mb-4 text-red-500">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
              {contactItems.map((item) => (
                <div key={item.key}>
                  <div className="font-ibm-mono text-[11px] leading-tight font-medium tracking-[0.08em] uppercase text-red-500/60 mb-1">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.key === 'instagram' || item.key === 'phone' ? '_blank' : undefined}
                      rel={item.key === 'instagram' || item.key === 'phone' ? 'noopener noreferrer' : undefined}
                      className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-red-500 no-underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-red-500">
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}

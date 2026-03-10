// src/components/AboutSection.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { About, getStrapiImageUrl } from '@/lib/strapi';

interface AboutSectionProps {
  about: About | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) {
    return null;
  }

  // Extraer contenido de los bloques dinámicos
  const richTextBlocks = about.blocks?.filter(
    block => block.__component === 'shared.rich-text'
  ) || [];

  const quoteBlocks = about.blocks?.filter(
    block => block.__component === 'shared.quote'
  ) || [];

  const mediaBlocks = about.blocks?.filter(
    block => block.__component === 'shared.media'
  ) || [];

  return (
    <section className="min-h-screen bg-black text-white py-20 px-8 md:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '57px', // 42.7pt = 57px según el diseño
            fontWeight: 400,
            marginBottom: '60px'
          }}
        >
          {about.title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contenido de texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Rich Text Blocks */}
            {richTextBlocks.map((block, index) => (
              <div
                key={block.id}
                className="mb-8"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '24px', // 18pt = 24px según el diseño
                  lineHeight: 1.6,
                  fontWeight: 300
                }}
              >
                {block.body}
              </div>
            ))}

            {/* Quotes */}
            {quoteBlocks.map((block) => (
              <blockquote
                key={block.id}
                className="border-l-2 border-white/30 pl-6 my-8 italic"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '20px',
                  lineHeight: 1.8
                }}
              >
                {block.title && <p className="font-medium mb-2">{block.title}</p>}
                {block.body && <p className="text-white/70">{block.body}</p>}
              </blockquote>
            ))}
          </motion.div>

          {/* Media/Imágenes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {mediaBlocks.map((block) => (
              block.file && (
                <div key={block.id} className="relative aspect-[4/5] mb-8">
                  <Image
                    src={getStrapiImageUrl(block.file)}
                    alt="About image"
                    fill
                    className="object-cover"
                  />
                </div>
              )
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

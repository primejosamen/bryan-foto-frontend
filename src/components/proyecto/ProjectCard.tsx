'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';

interface ProjectCardProps {
  proyecto: Project;
  index: number;
}

export default function ProjectCard({ proyecto, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = getStrapiImageUrl(proyecto.foto_portada);

  const aspect = useMemo(() => {
    const w = proyecto.foto_portada?.width;
    const h = proyecto.foto_portada?.height;
    if (w && h) return `${w}/${h}`;
    return '4/5'; // fallback
  }, [proyecto.foto_portada]);

  return (
    <Link href={`/proyecto/${proyecto.slug}`} className="block">
      <motion.article
        className="relative flex-shrink-0 cursor-pointer overflow-hidden"
        style={{
          height: '72vh',
          aspectRatio: aspect,
          maxWidth: '85vw',
        }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08, duration: 0.45 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={proyecto.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 85vw, 70vw"
            priority={index < 2}
          />
        </div>

        {/* Overlay con título (rectángulo blanco) */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 16 }}
          transition={{ duration: 0.25 }}
        >
          <div className="inline-block">
            <div className="bg-white px-4 py-2">
              <h3
                className="text-black font-normal"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '24px',
                  lineHeight: 1.2,
                }}
              >
                {proyecto.titulo}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.article>
    </Link>
  );
}

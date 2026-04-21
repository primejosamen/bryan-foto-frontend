'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Project } from '@/models';
import { getOptimizedImageUrl } from '@/lib/helpers/image.helpers';

interface ProjectCardProps {
  proyecto: Project;
  index: number;
}

export default function ProjectCard({ proyecto, index }: ProjectCardProps) {
  const imageUrl = getOptimizedImageUrl(proyecto.foto_portada, 1000);

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
      </motion.article>
    </Link>
  );
}

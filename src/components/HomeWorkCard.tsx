'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Proyecto, getStrapiImageUrl } from '@/lib/strapi';

export default function HomeWorkCard({
  proyecto,
  priority = false,
}: {
  proyecto: Proyecto;
  priority?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ✅ Marco fijo según el diseño del cliente
  const FRAME_W = 472;
  const FRAME_H = 810;

  return (
    <Link href={`/proyecto/${proyecto.slug}`} className="block">
      <motion.article
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerMove={onMove}
        className="relative flex-shrink-0"
        style={{
          width: `${FRAME_W}px`,
          height: `${FRAME_H}px`,
          zIndex: 10, // ✅ Por encima del Canvas del logo (z-index: 2)
          position: 'relative',
        }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={getStrapiImageUrl(proyecto.foto_portada)}
            alt={proyecto.titulo}
            fill
            className="object-cover"
            sizes="472px"
            priority={priority}
          />
        </div>

        {/* Label en el cursor (tipo "kayako") */}
        <motion.div
          className="pointer-events-none absolute"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(12px, 12px)',
            zIndex: 100, // ✅ Muy alto para estar sobre todo
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.98 }}
          transition={{ duration: 0.12 }}
        >
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: 16,
              fontWeight: 600,
              color: '#ffffff',
              background: '#ff0000',
              padding: '8px 12px',
              lineHeight: 1,
            }}
          >
            {proyecto.titulo}
          </span>
        </motion.div>
      </motion.article>
    </Link>
  );
}

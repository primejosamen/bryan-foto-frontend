'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';

export default function HomeWorkCard({
  proyecto,
  priority = false,
}: {
  proyecto: Project;
  priority?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [clientPos, setClientPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    setClientPos({ x: e.clientX, y: e.clientY });
  };

  // ✅ Marco fijo según el diseño del cliente
  const FRAME_W = 472;
  const FRAME_H = 810;

  return (
    <Link href={`/proyecto/${proyecto.slug}`} className="block">
      <motion.article
        onPointerEnter={(e) => {
          setHover(true);
          setClientPos({ x: e.clientX, y: e.clientY });
        }}
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

        {/* Label en viewport (portal): no se recorta por overflow del track */}
        {mounted &&
          createPortal(
            <motion.div
              className="pointer-events-none fixed z-[9999]"
              style={{
                left: clientPos.x,
                top: clientPos.y,
                transform: 'translate(0, 0)',
              }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.98 }}
              transition={{ duration: 0.12 }}
            >
              <span className="block font-ibm-mono text-[23px] font-bold italic tracking-[-0.085em] text-white bg-accent px-1.5 py-0.5 leading-none whitespace-nowrap">
                {proyecto.titulo}
              </span>
            </motion.div>,
            document.body
          )}
      </motion.article>
    </Link>
  );
}

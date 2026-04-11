'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/models';
import { getStrapiImageUrl } from '@/lib/helpers/image.helpers';

export default function HomeWorkCard({
  proyecto,
  priority = false,
}: {
  proyecto: Project;
  priority?: boolean;
}) {
  // ✅ Marco fijo según el diseño del cliente
  const FRAME_W = 472;
  const FRAME_H = 810;

  return (
    <Link href={`/proyecto/${proyecto.slug}`} className="block">
      <article
        className="relative flex-shrink-0"
        style={{
          width: `${FRAME_W}px`,
          height: `${FRAME_H}px`,
          zIndex: 10, // ✅ Por encima del Canvas del logo (z-index: 2)
          position: 'relative',
        }}
      >
        <div className="group/img relative w-full h-full overflow-hidden">
          <Image
            src={getStrapiImageUrl(proyecto.foto_portada)}
            alt={proyecto.titulo}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover/img:scale-110"
            sizes="472px"
            priority={priority}
          />
        </div>
      </article>
    </Link>
  );
}

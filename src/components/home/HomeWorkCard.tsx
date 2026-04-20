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
  // Marco fluido: escala proporcionalmente al viewport
  // 1920px → 472px, 1440px → 354px, 1280px → 315px, 1024px → 252px
  return (
    <Link href={`/proyecto/${proyecto.slug}`} className="block">
      <article
        className="relative shrink-0"
        style={{
          width: 'clamp(240px, 24.6vw, 472px)',
          height: 'clamp(412px, 42.2vw, 810px)',
          zIndex: 10,
          position: 'relative',
        }}
      >
        <div className="group/img relative w-full h-full overflow-hidden">
          <Image
            src={getStrapiImageUrl(proyecto.foto_portada)}
            alt={proyecto.titulo}
            fill
            className="object-cover"
            sizes="(min-width: 1440px) 472px, (min-width: 1024px) 380px, 320px"
            priority={priority}
          />
        </div>
      </article>
    </Link>
  );
}

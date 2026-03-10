// src/app/proyecto/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProyectoBySlug, getProyectos } from '@/lib/strapi';
import ProyectoDetailView from '@/components/ProyectoDetailView';

interface ProyectoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProyectoPage({ params }: ProyectoPageProps) {
  const { slug } = await params;
  const proyecto = await getProyectoBySlug(slug);

  if (!proyecto) {
    notFound();
  }

  return <ProyectoDetailView proyecto={proyecto} />;
}

// Generar rutas estáticas para todos los proyectos
export async function generateStaticParams() {
  const proyectos = await getProyectos();
  
  return proyectos.map((proyecto) => ({
    slug: proyecto.slug,
  }));
}

// Metadata dinámica
export async function generateMetadata({ params }: ProyectoPageProps) {
  const { slug } = await params;
  const proyecto = await getProyectoBySlug(slug);
  
  if (!proyecto) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

  return {
    title: `${proyecto.titulo} | Bryan Photography`,
    description: proyecto.descripcion || `Proyecto de fotografía: ${proyecto.titulo}`,
  };
}

export const revalidate = 60;

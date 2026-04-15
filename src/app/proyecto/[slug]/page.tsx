// src/app/proyecto/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/api';
import ProyectoDetailView from '@/components/proyecto/ProyectoDetailView';

interface ProyectoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProyectoPage({ params }: ProyectoPageProps) {
  const { slug } = await params;
  const proyecto = await getProjectBySlug(slug);

  if (!proyecto) {
    notFound();
  }

  return <ProyectoDetailView proyecto={proyecto} />;
}

// Generar rutas estáticas para todos los proyectos
export async function generateStaticParams() {
  const proyectos = await getProjects();
  
  return proyectos.map((proyecto) => ({
    slug: proyecto.slug,
  }));
}

// Metadata dinámica
export async function generateMetadata({ params }: ProyectoPageProps) {
  const { slug } = await params;
  const proyecto = await getProjectBySlug(slug);
  
  if (!proyecto) {
    return {
      title: 'Project no encontrado',
    };
  }

  return {
    title: `${proyecto.titulo} | Bryan Torres`,
    description: proyecto.descripcion || `Project de fotografía: ${proyecto.titulo}`,
  };
}

export const revalidate = 60;

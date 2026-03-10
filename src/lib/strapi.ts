// src/lib/strapi.ts
// Funciones para conectar con Strapi API

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Tipos basados en tu estructura de Strapi
export interface Proyecto {
  id: number;
  documentId: string;
  titulo: string;
  slug: string;
  descripcion?: string;
  foto_portada: StrapiImage;
  galeria?: StrapiImage[];
  orden: number;
  visible: boolean;
}

export interface StrapiImage {
  id: number;
  url: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface About {
  id: number;
  title: string;
  blocks: AboutBlock[];
}

export interface AboutBlock {
  __component: string;
  id: number;
  body?: string;
  title?: string;
  file?: StrapiImage;
}

export interface Contacto {
  id: number;
  email: string;
  telefono?: string;
  instagram?: string;
  ubicacion?: string;
}

export interface Global {
  id: number;
  siteName: string;
  siteDescription?: string;
  favicon?: StrapiImage;
}

// Helper para construir URL de imagen
export function getStrapiImageUrl(image: StrapiImage | undefined): string {
  if (!image) return '/placeholder.jpg';
  // Si la URL ya es absoluta, retornarla tal cual
  if (image.url.startsWith('http')) return image.url;
  // Si es relativa, agregar la URL de Strapi
  return `${STRAPI_URL}${image.url}`;
}

// Fetch de todos los proyectos
export async function getProyectos(): Promise<Proyecto[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/portafoliov1s?populate=*&sort=orden:asc`,
      { next: { revalidate: 60 } } // Revalidar cada 60 segundos
    );
    
    if (!res.ok) throw new Error('Error fetching proyectos');
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching proyectos:', error);
    return [];
  }
}

// Fetch de un proyecto por slug
export async function getProyectoBySlug(slug: string): Promise<Proyecto | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/portafoliov1s?filters[slug][$eq]=${slug}&populate=*`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) throw new Error('Error fetching proyecto');
    
    const data = await res.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching proyecto:', error);
    return null;
  }
}

// Fetch de About
export async function getAbout(): Promise<About | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/about?populate=*`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) throw new Error('Error fetching about');
    
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching about:', error);
    return null;
  }
}

// Fetch de Contacto
export async function getContacto(): Promise<Contacto | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/contacto?populate=*`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) throw new Error('Error fetching contacto');
    
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching contacto:', error);
    return null;
  }
}

// Fetch de Global (configuración del sitio)
export async function getGlobal(): Promise<Global | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/global?populate=*`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) throw new Error('Error fetching global');
    
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching global:', error);
    return null;
  }
}

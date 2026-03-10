// src/components/ContactSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Contacto } from '@/lib/strapi';

interface ContactSectionProps {
  contacto: Contacto | null;
}

export default function ContactSection({ contacto }: ContactSectionProps) {
  if (!contacto) {
    return null;
  }

  const contactItems = [
    { label: 'Email', value: contacto.email, href: `mailto:${contacto.email}` },
    { label: 'Teléfono', value: contacto.telefono, href: `tel:${contacto.telefono}` },
    { label: 'Instagram', value: contacto.instagram, href: `https://instagram.com/${contacto.instagram?.replace('@', '')}` },
    { label: 'Ubicación', value: contacto.ubicacion, href: null },
  ].filter(item => item.value); // Solo mostrar los que tienen valor

  return (
    <section className="min-h-screen bg-black text-white py-20 px-8 md:px-20 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
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
          Contact
        </motion.h2>

        {/* Lista de contactos */}
        <div className="space-y-8">
          {contactItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              {/* Indicador de ubicación - Rectángulo blanco del tamaño del texto */}
              <span 
                className="text-white/50 block mb-2"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                {item.label}
              </span>
              
              {item.href ? (
                <a
                  href={item.href}
                  target={item.label === 'Instagram' ? '_blank' : undefined}
                  rel={item.label === 'Instagram' ? 'noopener noreferrer' : undefined}
                  className="relative inline-block"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '24px', // 18pt = 24px según el diseño
                    fontWeight: 300
                  }}
                >
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {item.value}
                  </span>
                  {/* Rectángulo blanco que aparece al hover */}
                  <motion.span
                    className="absolute inset-0 bg-white -z-0"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    style={{ 
                      originX: 0,
                      padding: '0 8px',
                      margin: '-4px -8px'
                    }}
                  />
                </a>
              ) : (
                <span
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '24px',
                    fontWeight: 300
                  }}
                >
                  {item.value}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer opcional */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 pt-8 border-t border-white/10"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          © {new Date().getFullYear()} Bryan Photography. All rights reserved.
        </motion.div>
      </div>
    </section>
  );
}

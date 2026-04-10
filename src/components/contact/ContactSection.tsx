'use client';

import { motion } from 'framer-motion';
import type { ContactInfo } from '@/models';
import NavFooter from '@/components/layout/NavFooter';
import LogoAbout3D from '@/components/ui/LogoAbout3D';

interface ContactSectionProps {
  contacto: ContactInfo | null;
}

export default function ContactSection({ contacto }: ContactSectionProps) {

  if (!contacto) return null;

  const contactItems = [
    {
      key: 'phone',
      label: 'Phone',
      value: contacto.telefono,
      href: contacto.telefono ? `tel:${contacto.telefono}` : null,
    },
    {
      key: 'email',
      label: 'Email',
      value: contacto.email,
      href: contacto.email ? `mailto:${contacto.email}` : null,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      value: contacto.instagram,
      href: contacto.instagram
        ? `https://instagram.com/${contacto.instagram.replace('@', '')}`
        : null,
    },
    {
      key: 'location',
      label: 'Location',
      value: contacto.ubicacion,
      href: null,
    },
  ].filter((item) => item.value);

  const primaryItems = contactItems.filter(
    (item) => item.key === 'phone' || item.key === 'email',
  );

  const secondaryItems = contactItems.filter(
    (item) => item.key === 'instagram' || item.key === 'location',
  );

  return (
    <section className="relative h-auto md:h-screen overflow-auto md:overflow-hidden">
      {/* Fondo blanco fijo */}
      <div className="fixed inset-0 z-0 bg-white" />

      {/* ── 3D LOGO ── */}
      <LogoAbout3D />

      {/* Footer nav */}
      <NavFooter />

      {/* ── 4×4 GRID LAYOUT ── */}
      <div className="relative z-5 grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto_1fr] md:grid-rows-4 gap-2 min-h-screen md:h-screen pointer-events-none text-black p-6 md:p-0">

        {/* TÍTULO — mobile: top / desktop: row 2, col 3 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-start-1 md:col-start-3 row-start-1 md:row-start-2 self-end font-ibm-mono text-[clamp(1.5rem,2.5vw,32px)] font-bold leading-tight tracking-[-0.085em] pointer-events-auto pt-16 md:pt-0 bg-accent text-white px-2"
        >
          Contact
        </motion.h1>

        {/* LÍNEA SEPARADORA — mobile: below title / desktop: row 2, col 4 */}
        <div className="col-start-1 md:col-start-4 row-start-1 md:row-start-2 self-end pb-1 md:pb-3 pr-0 md:pr-[clamp(2rem,4vw,4rem)] pointer-events-none">
          <div className="w-full h-px bg-white/85" />
        </div>

        {/* ITEMS — mobile: stacked / desktop: row 3, col 3-4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-start-1 md:col-start-3 col-span-1 md:col-span-2 row-start-2 md:row-start-3 self-start pt-4 pr-0 md:pr-[clamp(2rem,4vw,4rem)] pointer-events-auto bg-accent text-white px-2"
        >
          <div className={`grid ${primaryItems.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-x-12 gap-y-5 items-start`}>
            {primaryItems.map((item) => (
              <div key={item.key}>
                <div className="font-ibm-mono text-[11px] leading-tight font-medium tracking-[0.08em] uppercase text-white/60 mb-1">
                  {item.label}
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.key === 'instagram' ? '_blank' : undefined}
                    rel={item.key === 'instagram' ? 'noopener noreferrer' : undefined}
                    className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-white no-underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-white">
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ITEMS SECUNDARIOS */}
          {secondaryItems.length > 0 && (
            <div className={`grid ${secondaryItems.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-x-12 gap-y-5 mt-8`}>
              {secondaryItems.map((item) => (
                <div key={item.key}>
                  <div className="font-ibm-mono text-[11px] leading-tight font-medium tracking-[0.08em] uppercase text-white/60 mb-1">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-white no-underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="font-ibm-mono text-[clamp(0.75rem,1vw,16px)] leading-snug font-normal text-white">
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
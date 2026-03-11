'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ContactInfo } from '@/models';
import { COLORS, FONT_FAMILY, FONT_SIZES } from '@/config/constants';
import { ROUTES } from '@/config/navigation';

const LAYOUT = {
  navTop: 140.58,
  contentTop: 300,
  navLeft: 603.2,
  contentLeft: 'clamp(8rem, 12vw, 12rem)',
} as const;

const PAGE_NAV_LINKS = [
  { href: ROUTES.about, label: 'About' },
  { href: ROUTES.contact, label: 'Contact' },
] as const;

interface ContactSectionProps {
  contacto: ContactInfo | null;
}

export default function ContactSection({ contacto }: ContactSectionProps) {
  const pathname = usePathname();

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
    <section className="relative min-h-screen">
      {/* Fondo blanco fijo */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 0,
          background: '#ffffff',
        }}
      />

      {/* Barra roja fija igual a About */}
      <div
        style={{
          position: 'fixed',
          top: `${LAYOUT.navTop}px`,
          left: 0,
          right: 0,
          zIndex: 10,
          height: 'auto',
        }}
      >
        <div
          style={{
            background: COLORS.accent,
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            paddingLeft: `${LAYOUT.navLeft}px`,
          }}
        >
          {PAGE_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: FONT_FAMILY,
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.white,
                  padding: '2px 20px',
                  opacity: isActive ? 1 : 0.7,
                  textDecoration: 'none',
                  borderBottom: isActive
                    ? '3px solid white'
                    : '3px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Capa de contenido */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        {/* Columna izquierda vacía para mantener la lógica visual del About */}
        <div style={{ width: '50%' }} />

        {/* Columna derecha */}
        <div
          style={{
            width: '50%',
            paddingTop: `${LAYOUT.contentTop}px`,
            paddingLeft: LAYOUT.contentLeft,
            paddingRight: 'clamp(2rem, 4vw, 4rem)',
            paddingBottom: '4rem',
            color: '#000000',
            pointerEvents: 'auto',
          }}
        >
          {/* Bloque principal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2rem',
              width: '100%',
            }}
          >
            {/* Título, corrido a la izquierda igual que About */}
            <div
              style={{
                flexShrink: 0,
                marginLeft: '-10.5rem',
                minWidth: '170px',
              }}
            >
              <h1
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: FONT_SIZES.title,
                  fontWeight: 400,
                  lineHeight: 1.05,
                  margin: 0,
                  color: '#000000',
                }}
              >
                Contact
              </h1>
            </div>

            {/* Línea + contenido */}
            <div
              style={{
                flex: 1,
                paddingTop: '1.3rem',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'rgba(0,0,0,0.85)',
                  marginBottom: '0.8rem',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    primaryItems.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                  columnGap: '3rem',
                  rowGap: '1.25rem',
                  alignItems: 'start',
                }}
              >
                {primaryItems.map((item) => (
                  <div key={item.key}>
                    <div
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: '11px',
                        lineHeight: 1.2,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.45)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {item.label}
                    </div>

                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.key === 'instagram' ? '_blank' : undefined}
                        rel={
                          item.key === 'instagram'
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: FONT_SIZES.body,
                          lineHeight: 1.3,
                          fontWeight: 300,
                          color: '#000000',
                          textDecoration: 'none',
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: FONT_SIZES.body,
                          lineHeight: 1.3,
                          fontWeight: 300,
                          color: '#000000',
                        }}
                      >
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {secondaryItems.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      secondaryItems.length > 1
                        ? 'repeat(2, minmax(0, 1fr))'
                        : '1fr',
                    columnGap: '3rem',
                    rowGap: '1.25rem',
                    marginTop: '2rem',
                  }}
                >
                  {secondaryItems.map((item) => (
                    <div key={item.key}>
                      <div
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '11px',
                          lineHeight: 1.2,
                          fontWeight: 500,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'rgba(0,0,0,0.45)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {item.label}
                      </div>

                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: FONT_SIZES.body,
                            lineHeight: 1.3,
                            fontWeight: 300,
                            color: '#000000',
                            textDecoration: 'none',
                          }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: FONT_SIZES.body,
                            lineHeight: 1.3,
                            fontWeight: 300,
                            color: '#000000',
                          }}
                        >
                          {item.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
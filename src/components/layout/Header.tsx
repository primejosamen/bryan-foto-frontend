// src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  siteName?: string;
  siteDescription?: string;
}

export default function Header({ siteName = 'Bryan', siteDescription = 'Photography' }: HeaderProps) {
  const pathname = usePathname();
  
  // No mostrar header en la página home (tiene su propio diseño)
  if (pathname === '/') return null; 
  
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Work' },
    { href: '/about', label: 'About' },
    { href: '/contacto', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Logo y título - Sin Logo3D para evitar duplicados */}
        <Link href="/" className="flex items-center gap-4">
          {/* Título y subtítulo */}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: '24px',
                fontWeight: 500,
                color: 'white',
                lineHeight: 1.2
              }}
            >
              {siteName}
            </span>
            <span
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.2
              }}
            >
              {siteDescription}
            </span>
          </div>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                color: 'white'
              }}
            >
              {link.label}
              {/* Línea de subrayado animada */}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Botón menú móvil */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={menuOpen ? 'open' : 'closed'}
            className="w-6 h-5 relative"
          >
            <motion.span
              className="absolute left-0 w-full h-px bg-white"
              style={{ top: '0%' }}
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 10 }
              }}
            />
            <motion.span
              className="absolute left-0 w-full h-px bg-white"
              style={{ top: '50%' }}
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
            />
            <motion.span
              className="absolute left-0 w-full h-px bg-white"
              style={{ top: '100%' }}
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -10 }
              }}
            />
          </motion.div>
        </button>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm p-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '24px',
                      fontWeight: 400,
                      color: 'white'
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

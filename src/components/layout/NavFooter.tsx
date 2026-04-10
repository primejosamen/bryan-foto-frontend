'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_LINKS } from '@/config/navigation';

/**
 * Shared navigation footer — red accent bar with About/Contact links.
 * Reused across all pages. Fixed at bottom on home, fixed at a set position on inner pages.
 */
export default function NavFooter() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-2 z-[9999] pointer-events-none px-6">
      <div className="pointer-events-auto flex h-10 items-center justify-center gap-12 px-6 md:h-4 md:justify-end md:gap-20 md:pr-8">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;

          if (link.external) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center font-ibm-mono text-[1.1rem] font-semibold leading-none md:text-[1.4rem] tracking-[-0.07em] px-3 py-1"
              >
                <span className="absolute inset-x-1 top-[65%] bottom-0 bg-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="relative z-10 text-red-500 transition-colors duration-200 group-hover:text-white">
                  {link.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="group relative inline-flex items-center font-ibm-mono text-[1.1rem] font-semibold leading-none md:text-[1.4rem] tracking-[-0.07em] px-3 py-1"
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute inset-x-1 top-[65%] bottom-0 bg-red-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              ) : (
                <span className="absolute inset-x-1 top-[65%] bottom-0 bg-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              )}
              <span className="relative z-10 text-red-500 transition-colors duration-200 group-hover:text-white">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

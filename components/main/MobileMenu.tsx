'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaWindowClose } from 'react-icons/fa';
import { cn } from '@/lib/shadcn/utils';

export function MobileMenu({ isOpen, onClose, logoSrc, navLinks, socialLinks }: MobileMenuProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-1000 flex transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={onClose} />

      {/* Menu Content */}
      <div
        className={cn(
          'relative ml-auto w-[80%] max-w-sm h-full bg-card/95 backdrop-blur-xl shadow-2xl border-l border-border/20 transition-transform duration-500 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-4 right-4 p-2 text-gold hover:scale-110 transition-transform z-10"
          >
            <FaWindowClose size={32} />
          </button>

          <div className="flex items-center pb-6 border-b border-border/10">
            <Link href="/" onClick={onClose}>
              <Image src={logoSrc} alt="Logo" width={140} height={42} className="h-auto w-auto" priority suppressHydrationWarning />
            </Link>
          </div>

          <nav className="flex flex-col gap-4 mt-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-lg font-bold tracking-wide text-foreground/80 hover:text-gold transition-colors py-2 border-b border-border/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="pt-8 text-gold font-bold tracking-widest uppercase text-xs mb-4">Let&apos;s Connect</div>
            <div className="flex items-center gap-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  aria-label={link.label || 'Social link'}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-platinum/50 dark:bg-muted/50 border border-border/10 text-gold hover:bg-gold hover:text-platinum transition-all shadow-lg"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

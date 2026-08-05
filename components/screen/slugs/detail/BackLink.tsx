// components/screen/slugs/detail/BackLink.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackLinkProps {
  href?: string;
  label?: string;
}
export default function BackLink({ href = '/collection/screen', label = 'Go back' }: BackLinkProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    // If browser has navigation history in current session, go back; otherwise fall back to href
    if (typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  const buttonContent = (
    <Link
      href={href}
      onClick={handleBack}
      aria-label={label}
      title={label}
      className="group fixed left-0 top-1/2 -translate-y-1/2 z-30 2xl:hidden flex items-center justify-center w-6 sm:w-8 h-24 sm:h-32 text-quicksilver opacity-30 hover:opacity-100 hover:text-gold transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <svg
        className="w-4 h-12 sm:h-16 transition-transform duration-200 group-hover:-translate-x-1"
        viewBox="0 0 12 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 4L3 16L9 28" />
      </svg>
    </Link>
  );

  if (!mounted) return null;

  return createPortal(buttonContent, document.body);
}

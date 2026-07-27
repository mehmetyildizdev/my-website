'use client';

/**
 * ThemedAlertModal.tsx
 *
 * PURPOSE:
 * Reusable themed security/alert modal component formatted with design system tokens.
 *
 * RATIONALE FOR createPortal & mounted STATE:
 * - Uses React `createPortal(..., document.body)` to attach the modal node directly to `document.body`.
 *   This decouples the modal from the inline DOM parent hierarchy, preventing flexbox/grid layout
 *   reflows or content shifts on surrounding page elements when opening/closing.
 * - Uses `mounted` state check to ensure Next.js SSR hydration completes before rendering the portal.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/shadcn/ui/button';

interface ThemedAlertModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  icon?: string;
  buttonText?: string;
  onClose: () => void;
}

export function ThemedAlertModal({
  open,
  title,
  description,
  icon = '🔒',
  buttonText = 'Understood',
  onClose,
}: ThemedAlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full mx-4 overflow-hidden rounded-xl border border-border/15 bg-pearl/30 shadow-2xl backdrop-blur-xl p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background soft color blur */}
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-ruby/10 via-transparent to-transparent blur-xl pointer-events-none opacity-80" />

        {/* Icon */}
        <div className="relative w-12 h-12 rounded-full bg-ruby/10 border border-ruby/30 flex items-center justify-center text-ruby text-xl font-bold">
          {icon}
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold tracking-tight text-accent relative z-10"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          {title}
        </h3>

        {/* Description */}
        <div className="text-sm text-muted-foreground relative z-10 leading-relaxed">
          {description}
        </div>

        {/* Close button */}
        <Button
          variant="glass"
          size="sm"
          className="w-full relative z-10 hover:text-ruby hover:border-ruby/50 text-quicksilver mt-2"
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </div>,
    document.body
  );
}

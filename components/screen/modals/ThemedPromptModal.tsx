'use client';

/**
 * ThemedPromptModal.tsx
 *
 * PURPOSE:
 * Reusable themed text input modal component formatted with design system tokens and glassmorphism.
 * Replaces native browser `window.prompt()` with an interactive, accessible modal dialog.
 *
 * RATIONALE FOR createPortal & mounted STATE:
 * - Uses React `createPortal(..., document.body)` to attach the modal node directly to `document.body`.
 *   This decouples the modal from the inline DOM parent hierarchy, preventing flexbox/grid layout
 *   reflows or content shifts on surrounding page elements when opening/closing.
 * - Uses `mounted` state check to ensure Next.js SSR hydration completes before rendering the portal.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/shadcn/ui/button';

interface ThemedPromptModalProps {
  open: boolean;
  title: string;
  description: string;
  icon?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  initialValue?: string;
  submitText?: string;
  cancelText?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function ThemedPromptModal({
  open,
  title,
  description,
  icon = '✨',
  inputLabel = 'Value:',
  inputPlaceholder = '',
  initialValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
}: ThemedPromptModalProps) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  if (!open || !mounted) return null;

  const handleSubmit = () => {
    onSubmit(value);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative max-w-md w-full mx-4 overflow-hidden rounded-xl border border-border/15 bg-pearl/30 shadow-2xl backdrop-blur-xl p-6 flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background soft color glow */}
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent blur-xl pointer-events-none opacity-80" />

        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-lg font-bold">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-accent" style={{ fontFamily: 'var(--font-poppins)' }}>
              {title}
            </h3>
            <p className="text-xs text-quicksilver">{description}</p>
          </div>
        </div>

        {/* Input */}
        <div className="relative z-10 space-y-1.5">
          {inputLabel && <label className="text-xs font-medium text-quicksilver/80">{inputLabel}</label>}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full px-3 py-2 rounded-lg bg-obsidian/60 border border-border/20 text-titanium placeholder:text-quicksilver/40 text-sm focus:outline-none focus:border-gold/50 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCancel();
            }}
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 relative z-10 pt-2">
          <Button variant="glass" size="sm" className="hover:text-ruby hover:border-ruby/50 text-quicksilver" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="glass" size="sm" className="hover:text-gold hover:border-gold/50 text-gold" onClick={handleSubmit}>
            {submitText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

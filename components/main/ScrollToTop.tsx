'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/shadcn/ui/button';

/**
 * Floating "scroll to top" button.
 * Appears after the user scrolls past 400px.
 * Placed fixed at bottom-right — add to any layout that needs it.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Button
      onClick={scrollTop}
      aria-label="Scroll to top"
      variant="glass"
      size="icon-lg"
      className={`fixed bottom-8 right-6 z-50 rounded-full shadow-lg cursor-pointer
                  hover:shadow-xl
                  ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4'}`}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}

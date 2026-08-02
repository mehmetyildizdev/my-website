import React from 'react';
import Footer from '@/components/blog/Footer';
import { ScrollToTop } from '@/components/main/ScrollToTop';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="blog">
      {children}

      <Footer />
      <ScrollToTop />
    </div>
  );
}

'use client';

import { useLayoutEffect } from 'react';

export default function LogSuppressor() {
  useLayoutEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('width(-1)')) {
        return;
      }
      originalWarn(...args);
    };
  }, []);

  return null;
}

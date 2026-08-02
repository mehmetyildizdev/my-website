'use client';

import { useSyncExternalStore } from 'react';

const XL_MEDIA_QUERY = '(min-width: 1280px)';

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(XL_MEDIA_QUERY);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(XL_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** Tailwind `xl` — only true when desktop Summary should mount. */
export function useIsXlBreakpoint() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

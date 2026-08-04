/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useEffect, useState } from 'react';
import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

function findText(text: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('*'))
    .filter((el) => el.textContent?.trim() === text)
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    })
    .sort(
      (a, b) =>
        a.getBoundingClientRect().width * a.getBoundingClientRect().height -
        b.getBoundingClientRect().width * b.getBoundingClientRect().height,
    )[0];
}

function findLoginCard(title: HTMLElement, loginHeading: HTMLElement) {
  const candidates: HTMLElement[] = [];
  let current = title.parentElement;

  while (current) {
    const rect = current.getBoundingClientRect();

    if (
      current.contains(loginHeading) &&
      rect.width > 250 &&
      rect.width < window.innerWidth * 0.9 &&
      rect.height > 120
    ) {
      candidates.push(current);
    }

    current = current.parentElement;
  }

  return candidates.sort((a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return aRect.width * aRect.height - bRect.width * bRect.height;
  })[0];
}

function BackToWebsite() {
  const [position, setPosition] = useState<
    { top: number; left: number; width: number } | null
  >(null);

  useEffect(() => {
    const update = () => {
      const title = findText('Mehmet Yıldız');
      const loginHeading = findText('Choose login provider');

      if (!title || !loginHeading) {
        setPosition(null);
        return;
      }

      const card = findLoginCard(title, loginHeading);

      if (!card) {
        setPosition(null);
        return;
      }

      const rect = card.getBoundingClientRect();
      setPosition({
        top: rect.top - 46,
        left: rect.left,
        width: rect.width,
      });
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!position) return null;

  return (
    <a
      href="/"
      aria-label="Back to website"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        boxSizing: 'border-box',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        border: '1px solid #454754',
        borderRadius: 4,
        background: '#191a21',
        color: '#c7c9d6',
        fontSize: 13,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      ← Back to website
    </a>
  );
}

function isIgnoredSanityError(reason: unknown): boolean {
  if (!reason) return false;

  if (typeof reason === 'string') {
    return (
      reason.includes('network error') ||
      reason.includes('No activity within') ||
      reason.includes('event-source-polyfill') ||
      reason.includes('Reconnecting')
    );
  }

  if (typeof reason === 'object') {
    const err = reason as { message?: string; stack?: string; name?: string };
    const msg = err.message || '';
    const stack = err.stack || '';
    const name = err.name || '';
    return (
      msg.includes('network error') ||
      msg.includes('No activity within') ||
      msg.includes('event-source-polyfill') ||
      msg.includes('Reconnecting') ||
      stack.includes('event-source-polyfill') ||
      name.includes('EventSource')
    );
  }

  return false;
}

// Intercept at module execution time (before NextStudio & Next dev overlay hook in)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (isIgnoredSanityError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      if (
        isIgnoredSanityError(event.error) ||
        isIgnoredSanityError(event.message)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (args.some((arg) => isIgnoredSanityError(arg))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

/**
 * Sanity Studio makes persistent EventSource connections to the Sanity API
 * for real-time content updates. When the browser throttles or drops these
 * connections (background tab, sleep, heartbeat timeouts, etc.), event-source-polyfill
 * or the browser emits "No activity within..." or "TypeError: network error".
 *
 * Next.js dev overlay catches these as unhandled errors or console.error calls.
 * This wrapper suppresses these non-fatal background reconnection messages.
 */
export function StudioClientWrapper() {
  return (
    <>
      <NextStudio config={config} />
      <BackToWebsite />
    </>
  );
}




// components/screen/slugs/detail/BackLink.tsx
import Link from 'next/link';

export default function BackLink({ href = '/collection/screen', label = 'Back to Overview' }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-xs text-quicksilver transition-colors hover:text-gold">
      <span aria-hidden>←</span> {label}
    </Link>
  );
}

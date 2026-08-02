import { Separator } from '@/components/shadcn/ui/separator';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bottom-0 left-0 w-full h-8 bg-pearl flex items-center justify-center">
      <Separator className="absolute top-0 left-0 w-full" />
      <p className="text-xs">
        © {currentYear}{' '}
        <Link href="/" className="hover:text-primary transition-colors">
          Mehmet Yildiz
        </Link>
        . All rights reserved.
      </p>
      <div className="ml-4 flex items-center gap-4">
        <Link href="/privacy" className="text-emerald text-xs hover:underline transition-all">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}

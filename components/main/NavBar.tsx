'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { FaLinkedinIn, FaTelegram, FaXTwitter, FaInstagram, FaGithub } from 'react-icons/fa6';

import { MobileMenu } from './MobileMenu';

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shadow, setShadow] = useState(false);
  useEffect(() => {
    setMounted(true);
    const handleShadow = () => {
      if (window.scrollY >= 90) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };
    handleShadow(); // Check initial position
    window.addEventListener('scroll', handleShadow);
    return () => window.removeEventListener('scroll', handleShadow);
  }, []);

  const logoSrc = mounted && resolvedTheme === 'dark' ? '/logo_l.svg' : '/logo_d.svg';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/collection', label: 'Collection' },
    { href: '/studio', label: 'Studio' },
  ];

  const socialLinks = [
    { href: 'https://www.linkedin.com/in/yildizmehmet/', icon: <FaLinkedinIn size={20} /> },
    { href: 'https://x.com/albursavi', icon: <FaXTwitter size={20} /> },
    { href: 'https://www.instagram.com/mehmetyildizdev/', icon: <FaInstagram size={20} /> },
    { href: 'https://github.com/mehmetyildizdev', icon: <FaGithub size={20} /> },
    { href: 'https://t.me/memostar91', icon: <FaTelegram size={20} /> },
  ];

  const isScreenPage = pathname?.startsWith('/collection/screen');

  return (
    <header>
      <nav
        className={cn(
          'fixed top-0 w-full h-16 z-999 transition-all duration-500 border-b border-transparent',
          shadow
            ? 'bg-background/80 backdrop-blur-md border-border/20 shadow-[0_5px_5px_-5px_rgba(220,177,24,0.3)]'
            : isScreenPage
              ? 'bg-background/20 backdrop-blur-lg border-border/20'
              : 'bg-transparent',
        )}
      >
        <div className="lg:px-16 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image className="p-4 lg:p-2" src={logoSrc} alt="Logo" width={200} height={60} priority suppressHydrationWarning />
            </Link>
          </div>
          <div>
            <div className="hidden md:flex items-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="mr-8">
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
            </div>
            <div className="md:hidden mr-4 flex items-center">
              <ThemeToggle />
              <button onClick={() => setIsOpen(true)} className="p-2" aria-label="Open menu">
                <Menu role="button" className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} logoSrc={logoSrc} navLinks={navLinks} socialLinks={socialLinks} />
    </header>
  );
}

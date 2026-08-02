'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Film, Tv, Users, BarChart3, Database, Menu, X, Search } from 'lucide-react';
import NowPlayingSidebar from '@/components/screen/now-playing/NowPlayingSidebar';

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/collection/screen',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Movies',
    href: '/collection/screen/m',
    icon: Film,
  },
  {
    label: 'Shows',
    href: '/collection/screen/s',
    icon: Tv,
  },
  {
    label: 'People',
    href: '/collection/screen/p',
    icon: Users,
  },
  {
    label: 'Shared Charts',
    href: '/collection/screen/charts',
    icon: BarChart3,
  },
  {
    label: 'DB Stats',
    href: '/collection/screen/stats',
    icon: Database,
  },
];

export default function ScreenSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Sync search input with URL query param 'q' on navigation / client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchVal(params.get('q') || '');
    }
  }, [pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);

    const trimmed = val.trim();
    if (trimmed) {
      if (pathname === '/collection/screen/search') {
        router.replace(`/collection/screen/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/collection/screen/search?q=${encodeURIComponent(trimmed)}`);
      }
    } else {
      if (pathname === '/collection/screen/search') {
        router.replace('/collection/screen/search');
      }
    }
  };

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) return pathname === item.href;
    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
      const rest = pathname.slice(item.href.length);
      if (rest === '' || rest === '/') return true;
      if (/^\/\d+/.test(rest)) return false;
      return true;
    }
    return false;
  };

  const navContent = (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                active
                  ? 'bg-pearl/40 text-gold border border-gold/20 shadow-sm'
                  : 'text-quicksilver hover:text-foreground hover:bg-pearl/20 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-gold' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Edge Search Input */}
      <div className="px-3">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-2 px-0.5">Search</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-quicksilver" />
          <input
            type="text"
            placeholder="Search in database..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full bg-pearl/20 border border-border/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-foreground placeholder:text-quicksilver/50 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/30 transition-all font-medium font-rubik"
          />
        </div>
      </div>

      {/* Mini Now Playing Section for Desktop Sidebar */}
      <NowPlayingSidebar />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — visible only at 2xl (1536px) and above */}
      <aside className="sticky top-32 h-fit w-56 shrink-0 hidden 2xl:block">{navContent}</aside>

      {/* Mobile/tablet toggle button — visible below 2xl */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 2xl:hidden flex items-center justify-center w-12 h-12 rounded-full bg-pearl/80 border border-gold/20 shadow-lg backdrop-blur-md text-gold hover:bg-pearl hover:border-gold/40 transition-all"
        aria-label="Open screen navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Slide-in drawer — below 2xl only */}
      {open && (
        <div className="fixed inset-0 z-50 2xl:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border/20 shadow-2xl p-6 pt-20 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-quicksilver hover:text-foreground hover:bg-pearl/30 transition-colors"
              aria-label="Close screen navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">Screen</p>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

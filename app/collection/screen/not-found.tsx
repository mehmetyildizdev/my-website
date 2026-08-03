import Link from 'next/link';
import { Clapperboard, Search, BarChart3, Home } from 'lucide-react';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';

export default function ScreenNotFound() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/10 bg-pearl/5 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-gold/20 p-8 md:p-14 text-center">
      {/* Genre motifs background overlay matching Screen Hero */}
      <GenreBackground
        genres={[{ name: 'Science Fiction' }, { name: 'Mystery' }, { name: 'Action' }]}
        intensity={0.2}
        variant="repeat"
      />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6 my-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ruby/30 text-ruby bg-ruby/10 text-xs font-bold tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ruby opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ruby" />
          </span>
          404 · Signal Lost
        </div>

        {/* 404 Big Number & Title */}
        <div className="space-y-2">
          <span
            className="text-7xl md:text-8xl font-black text-gold/20 tracking-tighter leading-none select-none block"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            404
          </span>
          <h1
            className="text-3xl md:text-4xl font-black text-gold tracking-tight leading-tight flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Content Not Found in Database
            <Clapperboard className="h-7 w-7 text-gold/80 animate-pulse hidden sm:inline" />
          </h1>
        </div>

        {/* Subtitle / Description */}
        <p
          className="text-quicksilver text-sm sm:text-base leading-relaxed max-w-lg"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          The movie, TV show, person, or analytics view you requested could not be located in the current database index. It may not exist or has not been scrobbled yet.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Link
            href="/collection/screen"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Screen Dashboard
          </Link>
          <Link
            href="/collection/screen/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pearl/20 text-platinum border border-border/20 hover:bg-pearl/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105"
          >
            <Search className="w-4 h-4 text-sapphire" />
            Search Database
          </Link>
          <Link
            href="/collection/screen/charts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pearl/20 text-platinum border border-border/20 hover:bg-pearl/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105"
          >
            <BarChart3 className="w-4 h-4 text-emerald" />
            Analytics Charts
          </Link>
        </div>
      </div>
    </div>
  );
}

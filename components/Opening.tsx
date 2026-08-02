import React from 'react';
import Link from 'next/link';
import { FaTelegram, FaLinkedinIn, FaXTwitter, FaInstagram, FaGithub, FaTv, FaBookOpen, FaCompass, FaArrowRight } from 'react-icons/fa6';

const Opening: React.FC<OpeningProps> = ({ id }) => {
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/yildizmehmet/', icon: FaLinkedinIn, label: 'LinkedIn' },
    { href: 'https://x.com/albursavi', icon: FaXTwitter, label: 'X (Twitter)' },
    { href: 'https://www.instagram.com/mehmetyildizdev/', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://github.com/mehmetyildizdev', icon: FaGithub, label: 'GitHub' },
    { href: 'https://t.me/memostar91', icon: FaTelegram, label: 'Telegram' },
  ];

  return (
    <section id={id} className="relative box-border flex min-h-dvh items-center justify-center bg-diamond py-8 sm:py-16 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-12 lg:px-16 w-full">
        <header className="flex flex-col items-center gap-3 sm:gap-6">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-sapphire mb-2 sm:mb-4 animate-in fade-in duration-500 delay-100 fill-mode-both">
              Welcome to my domain!
            </p>
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-foreground animate-in fade-in duration-500 delay-300 fill-mode-both">
              Hello, I&apos;m
              <span className="relative ml-2.5 sm:ml-4 inline-block text-gold text-shadow-primary hover:scale-105 transition-transform duration-300">
                Mehmet
              </span>
            </h1>
          </div>

          <h2 className="text-base sm:text-2xl lg:text-4xl font-bold tracking-wider sm:tracking-[0.2em] uppercase text-platinum/80 animate-in fade-in duration-500 delay-450 fill-mode-both">
            Full-Stack Developer | IT Specialist
          </h2>
        </header>

        <div className="mx-auto mt-5 sm:mt-8 max-w-4xl text-center animate-in fade-in duration-500 delay-600 fill-mode-both">
          <p className="text-sm sm:text-xl leading-relaxed text-foreground/70 italic mb-2 sm:mb-3">
            a digital sanctuary where <span className="font-bold text-foreground">systematic logic</span> meets the{' '}
            <span className="font-bold text-foreground">alchemy of modular design</span>
          </p>
          <p className="text-xs sm:text-lg leading-relaxed text-foreground/70 max-w-2xl sm:max-w-3xl mx-auto hidden sm:block">
            Beyond the forge of applications, explore my personal chronicles, live trackers, and evolving analytics. Whether you seek custom
            digital engineering or wish to explore the realm, start your journey below.
          </p>
        </div>

        {/* Primary Conversion Action Buttons */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto animate-in fade-in duration-500 delay-750 fill-mode-both">
          {/* Primary CTA: Screen Vault */}
          <Link
            href="/collection/screen"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gold/20 border border-gold/40 text-foreground font-bold tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold/30 hover:shadow-gold/25 text-sm sm:text-lg"
          >
            <FaTv className="text-gold text-base sm:text-xl group-hover:scale-110 transition-transform duration-300 shrink-0" />
            <span>Explore Screen Vault</span>
            <FaArrowRight className="text-gold text-xs sm:text-sm group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
          </Link>

          {/* Secondary & Tertiary CTAs */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/blog"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 px-3 sm:px-7 py-3 sm:py-4 rounded-2xl bg-card/80 border border-border/40 text-foreground font-semibold tracking-wide shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-sapphire/50 hover:bg-muted/60 hover:shadow-sapphire/20 text-xs sm:text-lg whitespace-nowrap"
            >
              <FaBookOpen className="text-sapphire text-sm sm:text-xl group-hover:scale-110 transition-transform duration-300 shrink-0" />
              <span>Chronicles</span>
            </Link>

            <Link
              href="/about"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 rounded-2xl bg-card/60 border border-border/30 text-foreground/80 font-medium tracking-wide shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:bg-card/70 text-xs sm:text-lg whitespace-nowrap"
            >
              <FaCompass className="text-platinum text-sm sm:text-xl group-hover:scale-110 transition-transform duration-300 shrink-0" />
              <span>About Me</span>
            </Link>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-in fade-in duration-500 delay-900 fill-mode-both">
          {socialLinks.map((link, index) => (
            <a key={index} href={link.href} rel="noopener noreferrer" target="_blank" aria-label={link.label} className="group relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/20 bg-card/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-muted/50 hover:shadow-gold/20 lg:h-14 lg:w-14">
                {React.createElement(link.icon, {
                  className: 'text-gold text-lg lg:text-2xl transition-transform duration-300 group-hover:scale-110',
                })}
              </div>
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-platinum opacity-0 transition-all duration-300 group-hover:opacity-100 whitespace-nowrap pointer-events-none hidden sm:block">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Opening;

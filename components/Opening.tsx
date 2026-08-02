import React from 'react';
import { FaTelegram, FaLinkedinIn, FaXTwitter, FaInstagram, FaGithub } from 'react-icons/fa6';

const Opening: React.FC<OpeningProps> = ({ id }) => {
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/yildizmehmet/', icon: FaLinkedinIn, label: 'LinkedIn' },
    { href: 'https://x.com/albursavi', icon: FaXTwitter, label: 'X (Twitter)' },
    { href: 'https://www.instagram.com/mehmetyildizdev/', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://github.com/mehmetyildizdev', icon: FaGithub, label: 'GitHub' },
    { href: 'https://t.me/memostar91', icon: FaTelegram, label: 'Telegram' },
  ];

  return (
    <section
      id={id}
      className="relative box-border flex h-dvh max-h-dvh min-h-dvh items-center justify-center overflow-hidden bg-diamond pt-16"
    >
      {/* Decorative Background Elements (Gemstone Bokeh) */}
      {/* Decorative Background Elements (Gemstone Bokeh - Light Spectrum Flow) */}
      <div className="absolute top-[-10%] left-[-10%] h-150 w-150 rounded-full bg-ruby/4 blur-[160px] dark:bg-ruby/3" />
      <div className="absolute top-[-10%] right-[-10%] h-150 w-150 rounded-full bg-topaz/4 blur-[160px] dark:bg-topaz/3" />
      <div className="absolute bottom-[-10%] right-[-10%] h-150 w-150 rounded-full bg-emerald/4 blur-[160px] dark:bg-emerald/3" />
      <div className="absolute bottom-[-10%] left-[-10%] h-150 w-150 rounded-full bg-sapphire/4 blur-[160px] dark:bg-sapphire/3" />
      <div className="absolute top-1/2 left-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amethyst/4 blur-[200px] dark:bg-amethyst/3" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center sm:px-12 lg:px-16">
        <header className="flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-sapphire animate-in fade-in slide-in-from-bottom-4 duration-700">
              Welcome to my domain!
            </p>
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
              Hello, I&apos;m
              <span className="relative ml-4 inline-block text-gold text-shadow-primary hover:scale-105 transition-transform duration-300">
                Mehmet
              </span>
            </h1>
          </div>

          <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-platinum/80 md:text-2xl lg:text-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            Digital Product Architect
          </h2>
        </header>

        <div className="mx-auto mt-10 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both text-center">
          <p className="text-lg leading-relaxed text-foreground/70 sm:text-xl italic mb-4">
            a digital sanctuary where <span className="font-bold">systematic logic</span> meets the{' '}
            <span className="font-bold">alchemy of modular design</span>
          </p>
          <p className="text-lg leading-relaxed text-foreground/70 sm:text-xl">
            Beyond the forge of applications, you&apos;ll find my personal chronicles, live trackers, and the evolving stats of my journey.
            Whether you seek a custom-crafted solution for your venture or simply wish to explore the realm, you are welcome here.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
          {socialLinks.map((link, index) => (
            <a key={index} href={link.href} rel="noopener noreferrer" target="_blank" aria-label={link.label} className="group relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/20 bg-card/66 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-gold/50 hover:bg-muted/50 hover:shadow-gold/20 lg:h-16 lg:w-16">
                {React.createElement(link.icon, {
                  className: 'text-gold text-2xl lg:text-3xl transition-transform duration-300 group-hover:scale-110',
                })}
              </div>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-platinum opacity-0 transition-all duration-300 group-hover:-bottom-8 group-hover:opacity-100">
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

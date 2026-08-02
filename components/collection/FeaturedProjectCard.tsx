'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { ExternalLink, Sparkles, ImageIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export interface FeatureSnippet {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface FeaturedTechTag {
  label: string;
  icon?: ReactNode;
}

export type FeaturedAccentColor = 'sapphire' | 'gold' | 'amethyst';

export interface FeaturedProjectCardProps {
  title: string;
  tagline: string;
  badgeText?: string;
  description: string;
  darkImage?: string;
  lightImage?: string;
  placeholderText?: string;
  accentColor?: FeaturedAccentColor;
  snippets?: FeatureSnippet[];
  techStack?: FeaturedTechTag[];
  primaryLink?: string;
  primaryLinkLabel?: string;
  primaryLinkIcon?: ReactNode;
  secondaryLink?: string;
  secondaryLinkLabel?: string;
  secondaryLinkIcon?: ReactNode;
  className?: string;
}

const THEME_STYLES = {
  sapphire: {
    ambient1: 'bg-sapphire/10',
    ambient2: 'bg-amber-500/10',
    hoverBorder: 'hover:border-primary/30',
    badge: 'text-sapphire border-sapphire/20 bg-sapphire/10',
    title: 'text-sapphire',
    primaryBtn: 'bg-linear-to-r from-sapphire to-amethyst text-white font-bold shadow-md hover:shadow-sapphire/20',
    secondaryBtnHover: 'hover:border-sapphire/30',
    snippetIcon: 'text-sapphire',
    placeholder: {
      gradient: 'from-sapphire/10 via-obsidian/40 to-amethyst/10',
      borderHover: 'hover:border-sapphire/50',
      iconText: 'text-sapphire',
      badge: 'border-sapphire/30 text-sapphire bg-sapphire/10',
    },
  },
  gold: {
    ambient1: 'bg-gold/15',
    ambient2: 'bg-amber-500/10',
    hoverBorder: 'hover:border-gold/40',
    badge: 'text-topaz border-gold/30 bg-gold/10',
    title: 'text-gold',
    primaryBtn:
      'bg-linear-to-r from-gold via-amber-400 to-amber-500 text-diamond light:text-platinum font-black shadow-md hover:shadow-gold/25',
    secondaryBtnHover: 'hover:border-gold/40',
    snippetIcon: 'text-gold',
    placeholder: {
      gradient: 'from-gold/10 via-obsidian/40 to-amber-500/10',
      borderHover: 'hover:border-gold/50',
      iconText: 'text-gold',
      badge: 'border-gold/30 text-gold bg-gold/10',
    },
  },
  amethyst: {
    ambient1: 'bg-amethyst/10',
    ambient2: 'bg-sapphire/10',
    hoverBorder: 'hover:border-amethyst/30',
    badge: 'text-amethyst border-amethyst/20 bg-amethyst/10',
    title: 'text-amethyst',
    primaryBtn: 'bg-linear-to-r from-amethyst to-sapphire text-white font-bold shadow-md hover:shadow-amethyst/20',
    secondaryBtnHover: 'hover:border-amethyst/30',
    snippetIcon: 'text-amethyst',
    placeholder: {
      gradient: 'from-amethyst/10 via-obsidian/40 to-sapphire/10',
      borderHover: 'hover:border-amethyst/50',
      iconText: 'text-amethyst',
      badge: 'border-amethyst/30 text-amethyst bg-amethyst/10',
    },
  },
} as const;

export function FeaturedProjectCard({
  title,
  tagline,
  badgeText = 'FEATURED PROJECT',
  description,
  darkImage,
  lightImage,
  placeholderText = 'Image preview placeholder — Add your screenshot here',
  accentColor = 'sapphire',
  snippets = [],
  techStack = [],
  primaryLink = '/collection/screen',
  primaryLinkLabel = 'Preview Dashboard',
  primaryLinkIcon,
  secondaryLink,
  secondaryLinkLabel,
  secondaryLinkIcon,
  className,
}: FeaturedProjectCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const hasImage = Boolean(darkImage || lightImage);
  const theme = THEME_STYLES[accentColor] || THEME_STYLES.sapphire;

  const renderMediaContent = () => (
    <div className="group/img relative w-full aspect-video bg-muted/20 border-b border-border/20 overflow-hidden flex items-center justify-center cursor-pointer">
      {hasImage ? (
        <>
          {!isLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-none" />}
          {darkImage && (
            <Image
              src={darkImage}
              alt={title}
              fill
              className="hidden dark:block object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              onLoad={() => setIsLoaded(true)}
              priority
            />
          )}
          {lightImage && (
            <Image
              src={lightImage}
              alt={title}
              fill
              className="block dark:hidden object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              onLoad={() => setIsLoaded(true)}
              priority
            />
          )}
          {primaryLink && (
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none z-10" />
          )}
        </>
      ) : (
        /* Placeholder area when no image is supplied */
        <div
          className={cn(
            'group relative w-full h-full p-8 flex flex-col items-center justify-center text-center gap-4 bg-linear-to-br border-2 border-dashed border-border/40 transition-colors',
            theme.placeholder.gradient,
            theme.placeholder.borderHover,
          )}
        >
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 border border-border/30 shadow-lg group-hover:scale-105 transition-transform',
              theme.placeholder.iconText,
            )}
          >
            <ImageIcon className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <span className="text-sm font-bold text-foreground tracking-wide">{placeholderText}</span>
            <span className="text-xs text-muted-foreground">16:9 Aspect Ratio • Standard Screenshot Size</span>
          </div>
          <Badge variant="subtle" className={cn('text-[10px] uppercase font-mono tracking-wider', theme.placeholder.badge)}>
            IMAGE PLACEHOLDER
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/20 bg-card/66 shadow-2xl backdrop-blur-md transition-all duration-500 p-0 flex flex-col lg:flex-row',
        theme.hoverBorder,
        className,
      )}
    >
      {/* Background ambient lighting */}
      <div
        className={cn(
          'absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 blur-3xl pointer-events-none rounded-full',
          theme.ambient1,
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 blur-3xl pointer-events-none rounded-full',
          theme.ambient2,
        )}
      />

      <div className="relative grid lg:grid-cols-12 gap-0 w-full z-10">
        {/* Left / Top Media Section — Spans 7 cols on desktop */}
        <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-border/20">
          {primaryLink ? (
            primaryLink.startsWith('http') ? (
              <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="block w-full" aria-label={`View ${title}`}>
                {renderMediaContent()}
              </a>
            ) : (
              <Link href={primaryLink} className="block w-full" aria-label={`View ${title}`}>
                {renderMediaContent()}
              </Link>
            )
          ) : (
            renderMediaContent()
          )}

          {/* Quick Features / Snippets underneath image */}
          {snippets.length > 0 && (
            <div className="p-6 lg:p-8 grid sm:grid-cols-2 gap-4 bg-card/30">
              {snippets.map((snippet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-border/15 bg-card/40 backdrop-blur-xs transition-colors hover:bg-card/70 hover:border-border/30"
                >
                  {snippet.icon && <div className={cn('shrink-0 mt-0.5 text-lg', theme.snippetIcon)}>{snippet.icon}</div>}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-foreground tracking-wide">{snippet.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{snippet.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right / Main Content Section — Spans 5 cols on desktop */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 lg:p-10 gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Badge variant="subtle" className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1', theme.badge)}>
                <Sparkles className="h-3 w-3 mr-1.5 inline" />
                {badgeText}
              </Badge>
              {tagline && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tagline}</span>}
            </div>

            <div>
              <h2 className={cn('text-4xl md:text-5xl font-black leading-tight tracking-tight text-shadow-sm', theme.title)}>{title}</h2>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">{description}</p>
            </div>

            {/* Tech stack badges */}
            {techStack.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Built With</span>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge
                      key={tech.label}
                      variant="subtle"
                      className="flex items-center gap-1.5 py-1 px-3 bg-card/80 border-border/20 text-xs font-medium"
                    >
                      {tech.icon}
                      {tech.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 pt-4 border-t border-border/20">
            {primaryLink && (
              <Button
                asChild
                className={cn(
                  'w-full rounded-xl font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all',
                  theme.primaryBtn,
                )}
              >
                {primaryLink.startsWith('http') ? (
                  <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
                    {primaryLinkIcon}
                    {primaryLinkLabel}
                    <ExternalLink className="h-4 w-4 opacity-70 ml-auto" />
                  </a>
                ) : (
                  <Link href={primaryLink} className="inline-flex items-center justify-center gap-2">
                    {primaryLinkIcon}
                    {primaryLinkLabel}
                    <ArrowRight className="h-4 w-4 opacity-70 ml-auto" />
                  </Link>
                )}
              </Button>
            )}

            {secondaryLink && (
              <Button
                variant="outline"
                asChild
                className={cn('w-full rounded-xl font-bold hover:-translate-y-0.5 transition-all', theme.secondaryBtnHover)}
              >
                {secondaryLink.startsWith('http') ? (
                  <a
                    href={secondaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    {secondaryLinkIcon}
                    {secondaryLinkLabel}
                    <ExternalLink className="h-4 w-4 opacity-70 ml-auto" />
                  </a>
                ) : (
                  <Link href={secondaryLink} className="inline-flex items-center justify-center gap-2">
                    {secondaryLinkIcon}
                    {secondaryLinkLabel}
                    <ArrowRight className="h-4 w-4 opacity-70 ml-auto" />
                  </Link>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

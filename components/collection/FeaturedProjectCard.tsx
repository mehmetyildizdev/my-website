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

export interface FeaturedProjectCardProps {
  title: string;
  tagline: string;
  badgeText?: string;
  description: string;
  darkImage?: string;
  lightImage?: string;
  placeholderText?: string;
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

export function FeaturedProjectCard({
  title,
  tagline,
  badgeText = 'FEATURED PROJECT',
  description,
  darkImage,
  lightImage,
  placeholderText = 'Image preview placeholder — Add your screenshot here',
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

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/20 bg-card/66 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-primary/30 p-0 flex flex-col lg:flex-row',
        className,
      )}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-sapphire/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative grid lg:grid-cols-12 gap-0 w-full z-10">
        {/* Left / Top Media Section — Spans 7 cols on desktop */}
        <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-border/20">
          {primaryLink ? (
            primaryLink.startsWith('http') ? (
              <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="block w-full" aria-label={`View ${title}`}>
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
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none z-10" />
                    </>
                  ) : (
                    /* PlaceHolder Image Area */
                    <div className="group relative w-full h-full p-8 flex flex-col items-center justify-center text-center gap-4 bg-linear-to-br from-sapphire/10 via-obsidian/40 to-amethyst/10 border-2 border-dashed border-border/40 hover:border-sapphire/50 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 border border-border/30 shadow-lg text-sapphire group-hover:scale-105 transition-transform">
                        <ImageIcon className="h-8 w-8 text-sapphire" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-md">
                        <span className="text-sm font-bold text-foreground tracking-wide">{placeholderText}</span>
                        <span className="text-xs text-muted-foreground">16:9 Aspect Ratio • Standard Screenshot Size</span>
                      </div>
                      <Badge
                        variant="subtle"
                        className="text-[10px] uppercase font-mono tracking-wider border-sapphire/30 text-sapphire bg-sapphire/10"
                      >
                        IMAGE PLACEHOLDER
                      </Badge>
                    </div>
                  )}
                </div>
              </a>
            ) : (
              <Link href={primaryLink} className="block w-full" aria-label={`View ${title}`}>
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
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none z-10" />
                    </>
                  ) : (
                    /* PlaceHolder Image Area */
                    <div className="group relative w-full h-full p-8 flex flex-col items-center justify-center text-center gap-4 bg-linear-to-br from-sapphire/10 via-obsidian/40 to-amethyst/10 border-2 border-dashed border-border/40 hover:border-sapphire/50 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 border border-border/30 shadow-lg text-sapphire group-hover:scale-105 transition-transform">
                        <ImageIcon className="h-8 w-8 text-sapphire" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-md">
                        <span className="text-sm font-bold text-foreground tracking-wide">{placeholderText}</span>
                        <span className="text-xs text-muted-foreground">16:9 Aspect Ratio • Standard Screenshot Size</span>
                      </div>
                      <Badge
                        variant="subtle"
                        className="text-[10px] uppercase font-mono tracking-wider border-sapphire/30 text-sapphire bg-sapphire/10"
                      >
                        IMAGE PLACEHOLDER
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>
            )
          ) : (
            <div className="relative w-full aspect-video bg-muted/20 border-b border-border/20 overflow-hidden flex items-center justify-center">
              {hasImage ? (
                <>
                  {!isLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-none" />}
                  {darkImage && (
                    <Image
                      src={darkImage}
                      alt={title}
                      fill
                      className="hidden dark:block object-cover object-top"
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
                      className="block dark:hidden object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      onLoad={() => setIsLoaded(true)}
                      priority
                    />
                  )}
                </>
              ) : (
                /* PlaceHolder Image Area */
                <div className="group relative w-full h-full p-8 flex flex-col items-center justify-center text-center gap-4 bg-linear-to-br from-sapphire/10 via-obsidian/40 to-amethyst/10 border-2 border-dashed border-border/40 hover:border-sapphire/50 transition-colors">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/80 border border-border/30 shadow-lg text-sapphire group-hover:scale-105 transition-transform">
                    <ImageIcon className="h-8 w-8 text-sapphire" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-md">
                    <span className="text-sm font-bold text-foreground tracking-wide">{placeholderText}</span>
                    <span className="text-xs text-muted-foreground">16:9 Aspect Ratio • Standard Screenshot Size</span>
                  </div>
                  <Badge
                    variant="subtle"
                    className="text-[10px] uppercase font-mono tracking-wider border-sapphire/30 text-sapphire bg-sapphire/10"
                  >
                    IMAGE PLACEHOLDER
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Quick Features / Snippets underneath image */}
          {snippets.length > 0 && (
            <div className="p-6 lg:p-8 grid sm:grid-cols-2 gap-4 bg-card/30">
              {snippets.map((snippet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-border/15 bg-card/40 backdrop-blur-xs transition-colors hover:bg-card/70 hover:border-border/30"
                >
                  {snippet.icon && <div className="shrink-0 mt-0.5 text-sapphire text-lg">{snippet.icon}</div>}
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
              <Badge
                variant="subtle"
                className="text-[10px] font-black uppercase tracking-widest text-sapphire border-sapphire/20 bg-sapphire/10 px-2.5 py-1"
              >
                <Sparkles className="h-3 w-3 mr-1.5 inline" />
                {badgeText}
              </Badge>
              {tagline && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tagline}</span>}
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight text-shadow-sm">{title}</h2>
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
                className="w-full rounded-xl bg-linear-to-r from-sapphire to-amethyst text-white font-bold shadow-md hover:-translate-y-0.5 hover:shadow-sapphire/20 hover:shadow-lg transition-all"
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
                className="w-full rounded-xl font-bold hover:-translate-y-0.5 hover:border-sapphire/30 transition-all"
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

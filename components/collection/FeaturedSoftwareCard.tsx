'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface TechStackItem {
  label: string;
  icon: ReactNode;
  desc: string;
}

interface FeaturedSoftwareCardProps {
  title: string;
  description: string;
  tagline: string;
  darkImage: string;
  lightImage: string;
  platformLabel: string;
  platformIcon?: ReactNode;
  techStack: TechStackItem[];
  primaryLink: string;
  primaryLinkLabel: string;
  primaryLinkIcon?: ReactNode;
  secondaryLink?: string;
  secondaryLinkLabel?: string;
  secondaryLinkIcon?: ReactNode;
  className?: string;
}

export function FeaturedSoftwareCard({
  title,
  description,
  tagline,
  darkImage,
  lightImage,
  platformLabel,
  platformIcon,
  techStack,
  primaryLink,
  primaryLinkLabel,
  primaryLinkIcon,
  secondaryLink,
  secondaryLinkLabel,
  secondaryLinkIcon,
  className,
}: FeaturedSoftwareCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border-glint/20 bg-card/66 shadow-2xl backdrop-blur-md transition-all duration-500 hover:bg-card hover:shadow-gold/10 hover:border-primary/20 py-0 flex-row',
        className,
      )}
    >
      {/* Accent gradient strip behind content */}
      <div className="absolute inset-0 bg-linear-to-tl from-primary/5 via-transparent to-card/33 pointer-events-none" />

      <div className="relative grid lg:grid-cols-12 gap-0 w-full">
        {/* Left Column (Image & Main Description) - Spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-border/20">
          {/* 16:9 Image */}
          <div className="relative w-full aspect-video bg-muted/33 border-b border-border/20 overflow-hidden lg:rounded-tl-3xl">
            {/* Loading Skeleton */}
            {!isLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-none" />}

            {/* Corner Wrap Badge */}
            <div className="absolute top-6 -right-16 z-20 w-56 rotate-45 bg-primary/50 backdrop-blur-md border-y border-primary/20 text-foreground text-[10px] font-black tracking-widest uppercase py-2 shadow-xl flex items-center justify-center gap-2 pointer-events-auto">
              {platformIcon}
              {platformLabel}
            </div>

            {/* Dark Mode Image */}
            <Image
              src={darkImage}
              alt={title}
              fill
              className="hidden dark:block object-cover object-top"
              sizes="(max-width: 1920px) 100vw, 100vw"
              onLoad={() => setIsLoaded(true)}
              priority
            />
            {/* Light Mode Image */}
            <Image
              src={lightImage}
              alt={title}
              fill
              className="block dark:hidden object-cover object-top"
              sizes="(max-width: 1920px) 100vw, 100vw"
              onLoad={() => setIsLoaded(true)}
              priority
            />
          </div>

          {/* Description Text */}
          <div className="p-8 lg:p-10 flex flex-col gap-5">
            <div>
              <Badge
                variant="outline"
                className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 px-2 mb-2"
              >
                {tagline}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight text-shadow-sm">{title}</h2>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">{description}</p>
          </div>
        </div>

        {/* Right Column (Meta & Actions) - Spans 4 cols */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-10 p-8 lg:p-10 bg-gold/5 lg:rounded-tr-3xl lg:rounded-br-3xl">
          {/* Tech Stack List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Core Technologies</h3>
            <div className="flex flex-col gap-3">
              {techStack.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card/66 border border-border/20 shadow-sm transition-colors hover:border-primary/20"
                >
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border/20 shadow-inner">
                    {t.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{t.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-2">
            <Button
              asChild
              className="w-full rounded-xl bg-linear-to-tl from-primary/80 to-primary/40 text-primary-foreground font-bold shadow-md hover:-translate-y-0.5 hover:shadow-gold/30 hover:shadow-lg"
            >
              <a
                href={primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2"
              >
                {primaryLinkIcon}
                {primaryLinkLabel}
                <ExternalLink className="h-4 w-4 opacity-70 ml-auto group-hover:opacity-100 transition-opacity" />
              </a>
            </Button>
            {secondaryLink && (
              <Button variant="outline" asChild className="w-full rounded-xl font-bold hover:-translate-y-0.5 hover:border-primary/20">
                <a
                  href={secondaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2"
                >
                  {secondaryLinkIcon}
                  {secondaryLinkLabel}
                  <ExternalLink className="h-4 w-4 opacity-70 ml-auto group-hover:opacity-100 transition-opacity" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

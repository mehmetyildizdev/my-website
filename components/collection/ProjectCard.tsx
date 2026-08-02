import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';
import { FaGithub } from 'react-icons/fa';

interface ProjectTag {
  label: string;
  icon?: ReactNode;
}

interface ProjectCardProps {
  title: string;
  description: string;
  tagline: string;
  icon: ReactNode;
  tags: ProjectTag[];
  githubLink: string;
  externalLink?: string;
  className?: string;
}

export function ProjectCard({ title, description, tagline, icon, tags, githubLink, externalLink, className }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        'group relative flex flex-col sm:flex-row items-start gap-6 rounded-3xl border border-border/20 bg-card/66 p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card hover:border-primary/20 py-6',
        className,
      )}
    >
      {/* Icon block */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-inner transition-colors group-hover:border-primary/33">
        <div className="text-2xl text-primary">{icon}</div>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="subtle" className="text-[10px] font-black uppercase tracking-widest text-primary bg-transparent border-0 px-0">
              {tagline}
            </Badge>
            <h3 className="text-2xl font-bold text-foreground leading-snug mt-1 group-hover:text-gold transition-colors duration-200">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="glass" asChild className="rounded-xl font-bold hover:border-primary/20 hover:text-gold">
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <FaGithub className="text-base" />
                GitHub
                {!externalLink && <ExternalLink className="h-3 w-3 opacity-60" />}
              </a>
            </Button>
            {externalLink && (
              <Button variant="glass" asChild className="rounded-xl font-bold hover:border-primary/20 hover:text-primary">
                <a href={externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  Visit
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">{description}</p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((t) => (
            <Badge key={t.label} variant="subtle" className="flex items-center gap-1.5 py-1 px-3">
              {t.icon && <span className="text-xs">{t.icon}</span>}
              {t.label}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

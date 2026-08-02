import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { FaTwitter, FaGithub, FaLinkedinIn, FaInstagram, FaYoutube, FaLink } from 'react-icons/fa';
import { Separator } from '@/components/shadcn/ui/separator';

function SocialIcon({ name, url, colorClass }: { name?: string; url?: string; colorClass: string }) {
  const label = (name ?? '').toLowerCase();

  let Icon = FaLink;

  if (label.includes('twitter') || label.includes('x.com') || url?.includes('x.com') || url?.includes('twitter')) {
    Icon = FaTwitter;
  } else if (label.includes('github') || url?.includes('github')) {
    Icon = FaGithub;
  } else if (label.includes('linkedin') || url?.includes('linkedin')) {
    Icon = FaLinkedinIn;
  } else if (label.includes('instagram') || url?.includes('instagram')) {
    Icon = FaInstagram;
  } else if (label.includes('youtube') || url?.includes('youtube')) {
    Icon = FaYoutube;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="group relative flex items-center justify-center h-6 w-6 transition-transform hover:-translate-y-0.5"
    >
      {/* Invisible SVG to define the gradient */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="social-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className={colorClass} stopColor="currentColor" />
          <stop offset="50%" className="text-silver" stopColor="currentColor" />
          <stop offset="100%" className={colorClass} stopColor="currentColor" />
        </linearGradient>
      </svg>

      {/* Base icon (solid color) */}
      <Icon className="absolute h-4 w-4 transition-opacity duration-300 group-hover:opacity-0" style={{ fill: 'url(#social-grad)' }} />

      {/* Hover icon (gradient filled) */}
      <Icon className="absolute h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 " />
    </a>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ author, allCategories = [], categories = [] }) => {
  const bioText = author?.bio?.[0]?.children?.map((c: any) => c.text).join(' ') ?? '';

  const socialLinks = (author?.social ?? []).filter((s) => s.url);
  const theme = getCategoryTheme(categories?.[0]?.title);

  return (
    <div className="hidden lg:block h-full">
      <div className="sticky top-36 w-72 space-y-6">
        {/* ── Author card ─────────────────────────────────────────── */}
        <div className="rounded-2xl p-4 text-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-conic ${theme.from} via-transparent ${theme.to}`}>
              {author?.image?.asset?.url ? (
                <Image
                  src={author.image.asset.url}
                  alt={author.image.alt ?? author?.name ?? 'Author'}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                /* Placeholder person icon */
                <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full p-2 text-metadata" fill="currentColor" aria-hidden>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>

            {/* Name + social icons */}
            <div className="min-w-0 flex-1">
              <div className={`font-semibold truncate text-metadata`}>{author?.name ?? 'Unknown Author'}</div>
              {socialLinks.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  {socialLinks.map((s, i) => (
                    <SocialIcon key={i} name={s.name} url={s.url} colorClass={theme.text} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {bioText && (
            <>
              <Separator />
              <p className="text-xs leading-loose text-metadata text-left pt-1">{bioText}</p>
            </>
          )}
        </div>

        {/* ── Categories ──────────────────────────────────────── */}
        {allCategories.length > 0 && (
          <div className="rounded-2xl p-4 text-sm">
            <Separator className="mb-3" />
            <div className="mb-3 font-semibold text-metadata pt-1">Categorical Archive</div>
            <div className="flex flex-col gap-1">
              {allCategories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/blog/category/${encodeURIComponent(cat.title.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-foreground/5"
                >
                  <span className={`text-xs font-semibold text-metadata`}>{cat.title}</span>
                  <span className="text-xs text-metadata">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

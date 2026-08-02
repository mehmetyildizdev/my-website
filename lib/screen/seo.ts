import { Metadata } from 'next';

export const DEFAULT_SCREEN_TITLE = 'Screen | Watch Statistics & Analytics';
export const DEFAULT_SCREEN_DESC = 'My personal movie and TV show watch history, ratings, and analytics.';
export const DEFAULT_SCREEN_IMAGE = '/images/seo/og-screen.webp';
export const DEFAULT_SCREEN_MINI_IMAGE = '/images/seo/og-screen-mini.webp';

export const SCREEN_SEO_CONFIG = {
  home: {
    title: 'Screen | Watch Statistics & Analytics',
    description: 'My personal movie and TV show watch history, ratings, and analytics.',
    path: '/collection/screen',
    image: '/images/seo/og-screen.webp',
  },
  movies: {
    title: 'Movie Analytics & Charts',
    description: 'Visual analytics of movie watch history — genres, decades, ratings, and director breakdowns.',
    path: '/collection/screen/m',
    image: '/images/seo/og-movies.webp',
  },
  shows: {
    title: 'TV Show Analytics & Charts',
    description: 'Visual analytics of TV show watch history — network breakdowns, season progress, binge patterns, and rating distributions.',
    path: '/collection/screen/s',
    image: '/images/seo/og-shows.webp',
  },
  people: {
    title: 'People & Cast Analytics',
    description: 'Analytics of actors, directors, and crew — collaboration networks, gender diversity, and top contributors.',
    path: '/collection/screen/p',
    image: '/images/seo/og-people.webp',
  },
  charts: {
    title: 'All Visualizations & Charts',
    description: 'Comprehensive data visualizations and interactive charts for movie and TV show watching habits.',
    path: '/collection/screen/charts',
    image: '/images/seo/og-shared.webp',
  },
  stats: {
    title: 'Database Statistics',
    description: 'Screen database overview, data coverage, table records, and schema relationships.',
    path: '/collection/screen/stats',
    image: '/images/seo/og-screen-mini.webp',
  },
  search: {
    title: 'Search',
    description: 'Search movies, TV shows, actors, and directors in personal watch statistics.',
    path: '/collection/screen/search',
    image: '/images/seo/og-screen-mini.webp',
    noIndex: true,
  },
} as const;

export interface ScreenSeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  cardType?: 'summary_large_image' | 'summary';
  type?: 'website' | 'article' | 'video.movie' | 'video.tv_show' | 'profile';
  noIndex?: boolean;
}

/**
 * Generates default base metadata for app/collection/screen/layout.tsx
 */
export function createScreenLayoutMetadata(): Metadata {
  return {
    title: {
      default: SCREEN_SEO_CONFIG.home.title,
      template: '%s | Screen',
    },
    description: SCREEN_SEO_CONFIG.home.description,
    alternates: { canonical: SCREEN_SEO_CONFIG.home.path },
    openGraph: {
      title: SCREEN_SEO_CONFIG.home.title,
      description: SCREEN_SEO_CONFIG.home.description,
      type: 'website',
      images: [SCREEN_SEO_CONFIG.home.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: SCREEN_SEO_CONFIG.home.title,
      description: SCREEN_SEO_CONFIG.home.description,
      images: [SCREEN_SEO_CONFIG.home.image],
    },
  };
}

/**
 * Helper to generate page-specific metadata for Screen hub pages.
 */
export function createScreenMetadata(options?: ScreenSeoOptions): Metadata {
  const {
    title,
    description = DEFAULT_SCREEN_DESC,
    path = '/collection/screen',
    image = DEFAULT_SCREEN_IMAGE,
    cardType = 'summary_large_image',
    type = 'website',
    noIndex = false,
  } = options || {};

  const fullTitle = title
    ? title.includes('Screen')
      ? title
      : `${title} | Screen`
    : DEFAULT_SCREEN_TITLE;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
    openGraph: {
      title: fullTitle,
      description,
      type,
      images: [image],
    },
    twitter: {
      card: cardType,
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export interface ScreenDetailSeoOptions {
  title: string;
  description: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  profilePath?: string | null;
  type: 'video.movie' | 'video.tv_show' | 'profile';
}

/**
 * Helper to generate metadata for dynamic detail pages ([id] routes).
 * Handles poster vs backdrop image selection and forces noindex/nofollow.
 */
export function createScreenDetailMetadata({
  title,
  description,
  posterPath,
  backdropPath,
  profilePath,
  type,
}: ScreenDetailSeoOptions): Metadata {
  const formatUrl = (path: string | null | undefined, widthPrefix: string) => {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/${widthPrefix}${path}`;
  };

  const posterUrl = formatUrl(posterPath, 'w500');
  const backdropUrl = formatUrl(backdropPath, 'w780');
  const profileUrl = formatUrl(profilePath, 'w500');

  const imageUrl = backdropUrl ?? posterUrl ?? profileUrl ?? DEFAULT_SCREEN_MINI_IMAGE;
  const cardType: 'summary_large_image' | 'summary' = backdropUrl ? 'summary_large_image' : 'summary';
  const fullTitle = `${title} | Screen`;

  return {
    title: fullTitle,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: fullTitle,
      description,
      type,
      images: [imageUrl],
    },
    twitter: {
      card: cardType,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

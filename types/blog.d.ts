declare global {
  type BodyBlock = PortableTextBlock | CodeBlock | TableBlock | ImageBlock | EmbedBlock | any;

  interface PortableTextSpan {
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
  }

  interface PortableTextBlock {
    _type: 'block';
    _key: string;
    style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
    children: Array<PortableTextSpan | { _type: string; _key: string; [key: string]: any }>;
    markDefs?: Array<{
      _type: string;
      _key: string;
      [key: string]: any;
    }>;
    listItem?: 'bullet' | 'number';
    level?: number;
  }

  interface CodeBlock {
    _type: 'code';
    _key: string;
    code: string;
    language?: string;
    filename?: string;
    highlightedLines?: number[];
  }
  interface TableRow {
    _type?: string;
    _key: string;
    cells: string[];
  }
  interface TableBlock {
    _type: 'table';
    _key: string;
    rows: TableRow[];
    caption?: string;
  }
  interface ImageBlock {
    _type: 'image';
    _key: string;
    asset?: SanityImage['asset'];
    alt?: string;
    caption?: string;
  }

  /** Universal body embed — either a URL-based iframe or a raw HTML snippet. */
  interface EmbedBlock {
    _type: 'embedBlock';
    _key: string;
    embedType: 'url' | 'htmlCode';
    embedUrl?: string;
    htmlCode?: string;
    aspectRatio?: string;
    caption?: string;
    alt?: string;
  }

  /** The resolved hero media for a post — either an image URL or an HTML visual. */
  type HeroMedia =
    | { kind: 'image'; url: string; alt?: string; caption?: string; width?: number; height?: number }
    | { kind: 'htmlVisual'; htmlCode: string; alt?: string; caption?: string; aspectRatio?: string };

  interface HeroImage {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  }
  interface SanityImage {
    asset?: {
      url?: string;
      metadata?: {
        dimensions?: {
          aspectRatio?: number;
          width?: number;
          height?: number;
        };
      };
    };
    alt?: string;
    caption?: string;
  }
  interface PostCategory {
    _id: string;
    title: string;
  }
  interface PostTag {
    _id: string;
    title: string;
  }
  interface Author {
    _id?: string;
    name?: string;
    image?: SanityImage;
    bio?: any[];
    social?: Array<{ name?: string; url?: string }>;
  }

  interface Post {
    _id: string;
    title: string;
    slug: { current: string };
    publishedAt: string;
    body: BodyBlock[];
    author?: {
      _id?: string;
      name?: string;
      image?: SanityImage;
      bio?: BodyBlock[];
      social?: Array<{ name?: string; url?: string }>;
    };
    categories?: PostCategory[];
    tags?: PostTag[];
    /** Static image — used for card thumbnails and social sharing. */
    mainImage?: SanityImage;
    /** Optional animated HTML hero — only rendered on the post page hero section. */
    htmlVisual?: {
      htmlCode: string;
      alt?: string;
      caption?: string;
      aspectRatio?: string;
    };
    /** Auto-translated English body — populated via Gemini in Sanity Studio. */
    translationBody?: BodyBlock[];
    excerpt?: string;
    metaDescription?: string;
  }

  interface ShareLink {
    label: string;
    href: string;
  }

  interface SidebarProps {
    author?: Author | null;
    allCategories?: DocWithCount[];
    categories?: PostCategory[];
    tags?: PostTag[];
    post?: Post;
  }

  interface PostPageData {
    post: Post;
    origin: string | null;
    postUrl: string;
    headings: HeadingItem[];
    shareLinks: ShareLink[];
  }

  interface DocWithCount {
    _id: string;
    title: string;
    count: number;
  }

  interface MonthGroup {
    ym: string; // "YYYY-MM"
    year: string;
    monthName: string;
    count: number;
    startDate: string; // "YYYY-MM-01"
    endDate: string; // first day of next month — used in < comparison
  }
}

export {};

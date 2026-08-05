// components/screen/slugs/genre/motifs/types.ts

export type Anchor = 'tl' | 'tr' | 'bl' | 'br' | 'c';

export type GemstoneToken = 'ruby' | 'sapphire' | 'emerald' | 'amethyst' | 'topaz';

export type BracketStyle = 'tactical' | 'ornate' | 'tech' | 'round' | 'simple';

export interface MotifProps {
  uid: string;
  className?: string;
  variant?: 'container' | 'repeat';
  token?: GemstoneToken;
  anchor?: Anchor;
}

export interface CornerBracketsProps {
  style?: BracketStyle;
  size?: 'normal' | 'small';
  className?: string;
}

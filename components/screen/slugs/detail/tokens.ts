// components/screen/slugs/detail/tokens.ts
// Static Tailwind class maps for design-system tokens. Tailwind can't see
// dynamically-built class strings, so every token→class pairing lives here.
export const TEXT: Record<Token, string> = {
  sapphire: 'text-sapphire',
  emerald: 'text-emerald',
  amethyst: 'text-amethyst',
  topaz: 'text-topaz',
  gold: 'text-gold',
  ruby: 'text-ruby',
  quicksilver: 'text-quicksilver',
  silver: 'text-silver',
};

export const BORDER: Record<Token, string> = {
  sapphire: 'border-sapphire/30',
  emerald: 'border-emerald/30',
  amethyst: 'border-amethyst/30',
  topaz: 'border-topaz/30',
  gold: 'border-gold/30',
  ruby: 'border-ruby/30',
  quicksilver: 'border-quicksilver/30',
  silver: 'border-silver/30',
};

export const BORDER_HOVER: Record<Token, string> = {
  sapphire: 'group-hover:border-sapphire/70',
  emerald: 'group-hover:border-emerald/70',
  amethyst: 'group-hover:border-amethyst/70',
  topaz: 'group-hover:border-topaz/70',
  gold: 'group-hover:border-gold/70',
  ruby: 'group-hover:border-ruby/70',
  quicksilver: 'group-hover:border-quicksilver/70',
  silver: 'group-hover:border-silver/70',
};

export const BG_SOFT: Record<Token, string> = {
  sapphire: 'bg-sapphire/10',
  emerald: 'bg-emerald/10',
  amethyst: 'bg-amethyst/10',
  topaz: 'bg-topaz/10',
  gold: 'bg-gold/10',
  ruby: 'bg-ruby/10',
  quicksilver: 'bg-quicksilver/10',
  silver: 'bg-silver/10',
};

export const RING_HOVER: Record<Token, string> = {
  sapphire: 'group-hover:ring-sapphire/60',
  emerald: 'group-hover:ring-emerald/60',
  amethyst: 'group-hover:ring-amethyst/60',
  topaz: 'group-hover:ring-topaz/60',
  gold: 'group-hover:ring-gold/60',
  ruby: 'group-hover:ring-ruby/60',
  quicksilver: 'group-hover:ring-quicksilver/60',
  silver: 'group-hover:ring-silver/60',
};

export const TEXT_HOVER: Record<Token, string> = {
  sapphire: 'group-hover:text-sapphire',
  emerald: 'group-hover:text-emerald',
  amethyst: 'group-hover:text-amethyst',
  topaz: 'group-hover:text-topaz',
  gold: 'group-hover:text-gold',
  ruby: 'group-hover:text-ruby',
  quicksilver: 'group-hover:text-quicksilver',
  silver: 'group-hover:text-silver',
};

/** CSS variable for inline use (gradients, shadows). */
export const VAR: Record<Token, string> = {
  sapphire: 'var(--sapphire)',
  emerald: 'var(--emerald)',
  amethyst: 'var(--amethyst)',
  topaz: 'var(--topaz)',
  gold: 'var(--gold)',
  ruby: 'var(--ruby)',
  quicksilver: 'var(--quicksilver)',
  silver: 'var(--silver)',
};

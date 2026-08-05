// components/screen/slugs/genre/motifs/index.ts
// Re-exports and registry mapping genre names to clean vector icons, anchors, and bracket styles.

import React from 'react';
import type { Anchor, BracketStyle } from './types';
import { CornerBrackets } from './CornerBrackets';
import {
  ActionIcon,
  AdventureIcon,
  AnimationIcon,
  ComedyIcon,
  CrimeIcon,
  DocumentaryIcon,
  DramaIcon,
  FamilyIcon,
  FantasyIcon,
  HistoryIcon,
  HorrorIcon,
  MusicIcon,
  MysteryIcon,
  PoliticsIcon,
  RealityIcon,
  RomanceIcon,
  ScifiIcon,
  SoapIcon,
  ThrillerIcon,
  WarIcon,
  WesternIcon,
  KidsIcon,
  DefaultIcon,
} from './GenreIcons';

export * from './types';
export * from './CornerBrackets';
export * from './GenreIcons';
export * from './RepeatPatterns';

export interface GenreMotifMeta {
  Icon: React.ComponentType<{ className?: string }>;
  anchor: Anchor;
  bracketStyle: BracketStyle;
}

const GENRE_MAP: Record<string, GenreMotifMeta> = {
  action: { Icon: ActionIcon, anchor: 'tr', bracketStyle: 'tactical' },
  adventure: { Icon: AdventureIcon, anchor: 'tl', bracketStyle: 'round' },
  animation: { Icon: AnimationIcon, anchor: 'bl', bracketStyle: 'tech' },
  comedy: { Icon: ComedyIcon, anchor: 'tr', bracketStyle: 'round' },
  crime: { Icon: CrimeIcon, anchor: 'br', bracketStyle: 'tactical' },
  documentary: { Icon: DocumentaryIcon, anchor: 'tl', bracketStyle: 'tactical' },
  drama: { Icon: DramaIcon, anchor: 'br', bracketStyle: 'ornate' },
  family: { Icon: FamilyIcon, anchor: 'tl', bracketStyle: 'round' },
  fantasy: { Icon: FantasyIcon, anchor: 'tr', bracketStyle: 'ornate' },
  history: { Icon: HistoryIcon, anchor: 'tr', bracketStyle: 'ornate' },
  horror: { Icon: HorrorIcon, anchor: 'tl', bracketStyle: 'simple' },
  music: { Icon: MusicIcon, anchor: 'bl', bracketStyle: 'round' },
  mystery: { Icon: MysteryIcon, anchor: 'tl', bracketStyle: 'simple' },
  romance: { Icon: RomanceIcon, anchor: 'br', bracketStyle: 'ornate' },
  'science fiction': { Icon: ScifiIcon, anchor: 'bl', bracketStyle: 'tech' },
  scifi: { Icon: ScifiIcon, anchor: 'bl', bracketStyle: 'tech' },
  thriller: { Icon: ThrillerIcon, anchor: 'bl', bracketStyle: 'tactical' },
  war: { Icon: WarIcon, anchor: 'tr', bracketStyle: 'tactical' },
  western: { Icon: WesternIcon, anchor: 'bl', bracketStyle: 'round' },
  politics: { Icon: PoliticsIcon, anchor: 'c', bracketStyle: 'simple' },
  reality: { Icon: RealityIcon, anchor: 'c', bracketStyle: 'round' },
  kids: { Icon: KidsIcon, anchor: 'c', bracketStyle: 'round' },
  soap: { Icon: SoapIcon, anchor: 'c', bracketStyle: 'ornate' },
};

export function getGenreMotifMeta(genreName: string): GenreMotifMeta {
  const normalized = (genreName || '').trim().toLowerCase();
  return GENRE_MAP[normalized] || { Icon: DefaultIcon, anchor: 'c', bracketStyle: 'simple' };
}

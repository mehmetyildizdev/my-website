export interface MediaInfo {
  key?: string | null;
  mediaType?: 'movie' | 'episode' | string | null;
  tmdbId?: string | null;
  episodeTmdbId?: string | null;
  imdbId?: string | null;
  title?: string | null;
  seriesTitle?: string | null;
  episodeTitle?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  stillPath?: string | null;
  overview?: string | null;
  tagline?: string | null;
  releaseDate?: string | null;
}

export interface PlaybackState {
  schemaVersion?: number;
  sessionId?: string | null;
  sequence?: number;
  state: 'playing' | 'paused' | 'loading' | 'seeking' | 'stopped' | 'completed' | 'error';
  isPlaying: boolean;
  isLoading: boolean;
  isSeeking: boolean;
  positionSeconds: number;
  durationSeconds?: number | null;
  progress?: number | null;
  observedAtMs: number;
  receivedAtMs: number;
  expiresAtMs: number;
  media?: MediaInfo | null;
}

export interface NowPlayingResponse {
  playback: PlaybackState | null;
  serverNowMs: number;
}

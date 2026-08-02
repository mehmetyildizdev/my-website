import { getIstanbulDateString, createIstanbulDate, parseAirDateToUTC } from './timezone';

export interface EpisodeRowForScheduling {
  tmdb_id: number;
  media_key?: string | null;
  season_number: number;
  episode_number: number;
  title: string | null;
  runtime: number | null;
  air_date: string | null;
  old_watched_at?: string | null;
}

export type EpisodeRow = EpisodeRowForScheduling;

export interface ScheduledEpisode {
  tmdb_id: number;
  media_key: string;
  season: number;
  number: number;
  title: string;
  runtime: number;
  old_watched_at: string | null;
  new_watched_at: string;
}

// Probabilistic helper for choosing episode count per day
export function getEpisodesCount(maxAllowed: number, isHeavyBinge = false): number {
  const rand = Math.random();
  if (isHeavyBinge) {
    if (maxAllowed >= 7) {
      // <30m runtime episodes sitcom style heavy binge:
      // 1ep (5%), 2eps (15%), 3eps (20%), 4eps (30%), 5eps (15%), 6eps (10%), 7eps (5%)
      if (rand < 0.05) return 1;
      if (rand < 0.2) return 2;
      if (rand < 0.4) return 3;
      if (rand < 0.7) return 4;
      if (rand < 0.85) return 5;
      if (rand < 0.95) return 6;
      return 7;
    } else {
      // >=30m runtime episodes drama style heavy binge:
      // 1ep (5%), 2eps (20%), 3eps (35%), 4eps (40%)
      if (rand < 0.05) return 1;
      if (rand < 0.25) return 2;
      if (rand < 0.6) return 3;
      return 4;
    }
  } else {
    if (maxAllowed >= 7) {
      // <30m runtime episodes (like 20-min sitcoms)
      // Adjustments: 1ep (18%), 2eps (50%), 3eps (15%), 4eps (10%), 5eps (5%), 6-7eps (2% total)
      if (rand < 0.18) return 1;
      if (rand < 0.68) return 2; // 0.18 + 0.50
      if (rand < 0.83) return 3; // 0.68 + 0.15
      if (rand < 0.93) return 4; // 0.83 + 0.10
      if (rand < 0.98) return 5; // 0.93 + 0.05
      if (rand < 0.995) return 6; // 0.98 + 0.015
      return 7; // remaining 0.005 (0.5%)
    } else {
      // >=30m runtime episodes (like 45-min dramas)
      // 1ep (15%), 2eps (60%), 3eps (18%), 4eps (7%)
      if (rand < 0.15) return 1;
      if (rand < 0.75) return 2; // 0.15 + 0.60
      if (rand < 0.93) return 3; // 0.75 + 0.18
      return 4; // remaining 0.07 (7%)
    }
  }
}

// Probabilistic helper for choosing day gaps
export function getDayGap(): number {
  const rand = Math.random();
  // Short gaps (83% total):
  // - 1 (no gap): 25%
  // - 2 (1-day gap): 25%
  // - 3 (2-day gap): 15%
  // - 4-8 (3-7 day gap): 18%
  // Long gaps (17% total):
  // - 2-3 weeks (14-27 days): 10%
  // - 4-6 weeks (28-48 days): 5%
  // - 7-12 weeks (49-84 days): 2%
  if (rand < 0.25) return 1; // 1 means consecutive days (0 days gap)
  if (rand < 0.5) return 2; // 1 day gap
  if (rand < 0.65) return 3; // 2 days gap
  if (rand < 0.83) {
    return 4 + Math.floor(Math.random() * 5); // 3 to 7 days gap
  }
  if (rand < 0.93) {
    // 2-3 weeks: 14 to 27 days
    return 14 + Math.floor(Math.random() * 14);
  }
  if (rand < 0.98) {
    // 4-6 weeks: 28 to 48 days
    return 28 + Math.floor(Math.random() * 21);
  }
  // Up to 12 weeks: 49 to 84 days
  return 49 + Math.floor(Math.random() * 36);
}

// Probabilistic helper for night owl hours (favoring evenings and late night/AM hours)
export function getRandomHour(): number {
  const rand = Math.random();
  // night owl:
  // - 00:00 - 03:59 (AM night): 35%
  // - 04:00 - 07:59 (Early morning): 2%
  // - 08:00 - 11:59 (Morning): 8%
  // - 12:00 - 17:59 (Afternoon): 15%
  // - 18:00 - 23:59 (Evening/Night): 40%
  if (rand < 0.35) {
    return Math.floor(Math.random() * 4); // 0, 1, 2, 3
  } else if (rand < 0.37) {
    return 4 + Math.floor(Math.random() * 4); // 4, 5, 6, 7
  } else if (rand < 0.45) {
    return 8 + Math.floor(Math.random() * 4); // 8, 9, 10, 11
  } else if (rand < 0.6) {
    return 12 + Math.floor(Math.random() * 6); // 12, 13, 14, 15, 16, 17
  } else {
    return 18 + Math.floor(Math.random() * 6); // 18, 19, 20, 21, 22, 23
  }
}

// Helper to get ISO week number in Europe/Istanbul timezone
export function getISOWeek(d: Date): number {
  const istanbulDateStr = getIstanbulDateString(d);
  const [year, month, day] = istanbulDateStr.split('-').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const week1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
}

export function parseYearOrDate(dateStr: string, isEnd: boolean): Date {
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const startOfYear = createIstanbulDate(year, 0, 1, 0, 0).getTime();
    const endOfYear = createIstanbulDate(year, 11, 31, 23, 59).getTime();
    return new Date(startOfYear + Math.random() * (endOfYear - startOfYear));
  }

  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    const day = parseInt(dateMatch[3], 10);
    if (!isEnd) {
      return createIstanbulDate(year, month, day, 0, 0);
    } else {
      return createIstanbulDate(year, month, day, 23, 59);
    }
  }

  return new Date(dateStr);
}

export function generateSchedule(
  watchedEpisodes: EpisodeRowForScheduling[],
  start: Date,
  end: Date,
  isRelaxed: boolean,
  isHeavyBinge: boolean = false,
): ScheduledEpisode[] {
  // Determine season finales (last episode of each season in the watched list)
  const seasonFinales = new Set<string>(); // formatted as "season-episode"
  const seasonToMaxEp = new Map<number, number>();
  for (const ep of watchedEpisodes) {
    const currentMax = seasonToMaxEp.get(ep.season_number) || 0;
    if (ep.episode_number > currentMax) {
      seasonToMaxEp.set(ep.season_number, ep.episode_number);
    }
  }
  for (const [season, maxEp] of seasonToMaxEp.entries()) {
    seasonFinales.add(`${season}-${maxEp}`);
  }

  // Scheduling loop variables
  const queue = [...watchedEpisodes];
  const scheduled: ScheduledEpisode[] = [];

  // Represent local calendar date in a timezone-neutral UTC Date object
  const startLocalStr = getIstanbulDateString(start);
  const [startY, startM, startD] = startLocalStr.split('-').map(Number);
  let currentDate = new Date(Date.UTC(startY, startM - 1, startD));

  const endLocalStr = getIstanbulDateString(end);
  const [endY, endM, endD] = endLocalStr.split('-').map(Number);
  const endDateUTC = new Date(Date.UTC(endY, endM - 1, endD));

  while (queue.length > 0) {
    const nextEp = queue[0];
    const epRuntime = nextEp.runtime || 30; // Default to 30 mins if null
    const maxAllowed = epRuntime < 30 ? 7 : 4;

    // Air Date Check: Watch date must be >= air_date
    if (nextEp.air_date) {
      const airDate = parseAirDateToUTC(nextEp.air_date);
      if (currentDate < airDate) {
        // Fast forward to air_date
        currentDate = new Date(airDate);

        // Add a random catch-up delay (0 to 6 days) to make it look realistic for ongoing shows
        const rand = Math.random();
        let delayDays = 0;
        if (rand < 0.3)
          delayDays = 0; // Same day: 30%
        else if (rand < 0.55)
          delayDays = 1; // 1 day later: 25%
        else if (rand < 0.7)
          delayDays = 2; // 2 days later: 15%
        else if (rand < 0.8)
          delayDays = 3; // 3 days later: 10%
        else if (rand < 0.9)
          delayDays = 4; // 4 days later: 10%
        else if (rand < 0.95)
          delayDays = 5; // 5 days later: 5%
        else delayDays = 6; // 6 days later: 5%

        currentDate.setUTCDate(currentDate.getUTCDate() + delayDays);
      }
    }

    // Dynamic scheduling check: calculate remaining episodes vs remaining days to fit user range
    const remainingEpisodes = queue.length;
    const diffTime = endDateUTC.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate expected remaining days needed at a natural watch pace (average 7.47 days gap per session)
    const averageEpsPerDay = epRuntime < 30 ? 2.5 : 2.17;
    const expectedWatchDays = remainingEpisodes / averageEpsPerDay;
    const averageGap = 7.47;
    const expectedRemainingDays = expectedWatchDays * averageGap;

    // Pro-rate scale factor to compress/expand gaps
    let scale = 1.0;
    if (remainingDays > 0 && expectedRemainingDays > 0) {
      scale = isRelaxed ? remainingDays / expectedRemainingDays : Math.min(1.0, remainingDays / expectedRemainingDays);
    }

    let count = getEpisodesCount(maxAllowed, isHeavyBinge);

    // If time is tight, bypass gaps and maximize watch counts to ensure we hit end_date
    const isTimeTight = remainingDays <= 0 || remainingEpisodes > remainingDays * 1.5;
    if (isTimeTight) {
      count = Math.max(count, Math.min(maxAllowed, remainingEpisodes));
    }

    // Cap by remaining items in queue
    count = Math.min(count, remainingEpisodes);

    // Build today's batch
    const batch: EpisodeRowForScheduling[] = [];
    let containsSeasonFinale = false;

    for (let i = 0; i < count; i++) {
      const ep = queue[i];

      // Strict Air Date Check: Never watch an episode before it airs!
      if (ep.air_date) {
        const airDate = parseAirDateToUTC(ep.air_date);
        if (currentDate < airDate) {
          break; // Stop batch here, we must wait for it to air
        }
      }

      const isFinale = seasonFinales.has(`${ep.season_number}-${ep.episode_number}`);
      batch.push(ep);

      if (isFinale) {
        containsSeasonFinale = true;
        // Group finale on the same day by ending the batch here
        break;
      }
    }

    // Remove selected batch from queue
    queue.splice(0, batch.length);

    // Pick random start time for today (night owl mode)
    const startHour = getRandomHour();
    const startMinute = Math.floor(Math.random() * 60);

    let currentTimestamp = createIstanbulDate(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      startHour,
      startMinute,
    );

    // Schedule the batch
    for (let i = 0; i < batch.length; i++) {
      const ep = batch[i];
      const watchedAt = new Date(currentTimestamp);

      scheduled.push({
        tmdb_id: ep.tmdb_id,
        media_key: ep.media_key || '',
        season: ep.season_number,
        number: ep.episode_number,
        title: ep.title || `Episode ${ep.episode_number}`,
        runtime: ep.runtime || 30,
        old_watched_at: ep.old_watched_at ? new Date(ep.old_watched_at).toISOString() : null,
        new_watched_at: watchedAt.toISOString(),
      });

      // Increment timestamp for next episode in batch (runtime + random break of 2-15 mins)
      const runMin = ep.runtime || 30;
      const breakMin = 2 + Math.floor(Math.random() * 14);
      currentTimestamp.setUTCMinutes(currentTimestamp.getUTCMinutes() + runMin + breakMin);
    }

    // Choose next watch day gap
    let gap = getDayGap();
    if (isTimeTight) {
      gap = 1;
    } else if (isRelaxed || scale < 1.0) {
      // Scale the gap to fit inside the user's custom date range
      gap = Math.max(1, Math.round(gap * scale));
    }

    // Season finale binge logic: 85% chance of 0-day gap (watch next day)
    if (containsSeasonFinale) {
      if (Math.random() < 0.85) {
        gap = 1;
      }
    }

    // Advance pointer in UTC date space
    currentDate.setUTCDate(currentDate.getUTCDate() + gap);
  }

  return scheduled;
}

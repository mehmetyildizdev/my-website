export function getIstanbulOffsetMinutes(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => {
    const p = parts.find((x) => x.type === type);
    return p ? parseInt(p.value, 10) : 0;
  };

  const year = getPart('year');
  const month = getPart('month') - 1;
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  const localUtc = Date.UTC(year, month, day, hour % 24, minute, second);
  return Math.round((localUtc - date.getTime()) / 60000);
}

export function createIstanbulDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const utcEstimate = new Date(Date.UTC(year, month, day, hour, minute));
  const offsetMin = getIstanbulOffsetMinutes(utcEstimate);
  const realUtc = new Date(utcEstimate.getTime() - offsetMin * 60000);
  const offsetMinCorrect = getIstanbulOffsetMinutes(realUtc);
  return new Date(utcEstimate.getTime() - offsetMinCorrect * 60000);
}

export function getIstanbulDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

export function getIstanbulTimeString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parts.find((p) => p.type === 'hour')!.value;
  const minute = parts.find((p) => p.type === 'minute')!.value;
  return `${hour}:${minute}`;
}

export function getIstanbulMonthYearString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'Europe/Istanbul',
  });
}

export function getIstanbulYear(date: Date): number {
  const dateStr = getIstanbulDateString(date);
  return parseInt(dateStr.split('-')[0], 10);
}

export function parseAirDateToUTC(airDate: string | Date): Date {
  if (airDate instanceof Date) {
    return new Date(Date.UTC(airDate.getFullYear(), airDate.getMonth(), airDate.getDate()));
  }

  if (typeof airDate === 'string') {
    const match = airDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const d = parseInt(match[3], 10);
      return new Date(Date.UTC(y, m, d));
    }
  }

  const d = new Date(airDate);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatAirDate(airDate: string | Date): string {
  if (airDate instanceof Date) {
    const y = airDate.getFullYear();
    const m = String(airDate.getMonth() + 1).padStart(2, '0');
    const d = String(airDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof airDate === 'string') {
    const match = airDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
  }
  return String(airDate);
}

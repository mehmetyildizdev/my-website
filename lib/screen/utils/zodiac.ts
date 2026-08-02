/**
 * Interface representing a Zodiac Sign's date range and metadata
 */
export interface ZodiacSign {
  name: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number; // 1-12
  endDay: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
}

/**
 * Array mapping the dates to their respective zodiac signs.
 * Zodiac periods generally bridge across two calendar months.
 */
export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: 'Capricorn',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
    element: 'Earth',
  },
  {
    name: 'Aquarius',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
    element: 'Air',
  },
  {
    name: 'Pisces',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
    element: 'Water',
  },
  {
    name: 'Aries',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
    element: 'Fire',
  },
  {
    name: 'Taurus',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
    element: 'Earth',
  },
  {
    name: 'Gemini',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
    element: 'Air',
  },
  {
    name: 'Cancer',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
    element: 'Water',
  },
  {
    name: 'Leo',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
    element: 'Fire',
  },
  {
    name: 'Virgo',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
    element: 'Earth',
  },
  {
    name: 'Libra',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    element: 'Air',
  },
  {
    name: 'Scorpio',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
    element: 'Water',
  },
  {
    name: 'Sagittarius',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
    element: 'Fire',
  },
];

/**
 * Determines the Zodiac sign based on month and day.
 *
 * @param month - Month as a number (1 - 12)
 * @param day - Day of the month (1 - 31)
 * @returns The matching ZodiacSign object, or null if inputs are invalid.
 */
export function getZodiacSign(month: number, day: number): ZodiacSign | null {
  // Simple guard clause for basic input validation
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Find the sign where the date falls within the range
  const sign = ZODIAC_SIGNS.find((zodiac) => {
    // Case 1: Standard range within the same calendar year (e.g., Aries: March 21 - April 19)
    if (zodiac.startMonth < zodiac.endMonth) {
      return (month === zodiac.startMonth && day >= zodiac.startDay) || (month === zodiac.endMonth && day <= zodiac.endDay);
    }

    // Case 2: Overlapping the calendar year end/start (Capricorn: Dec 22 - Jan 19)
    return (month === zodiac.startMonth && day >= zodiac.startDay) || (month === zodiac.endMonth && day <= zodiac.endDay);
  });

  return sign || null;
}

/**
 * Helper function to parse a standard Date object or date string
 */
export function getZodiacFromDate(dateInput: Date | string): ZodiacSign | null {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }

  const month = date.getMonth() + 1; // JS months are 0-11
  const day = date.getDate();

  return getZodiacSign(month, day);
}

/**
 * Helper to get a zodiac sign from a string date.
 */
export function getZodiac(birthDate: string | null): ZodiacSign | null {
  if (!birthDate) return null;
  return getZodiacFromDate(birthDate);
}

/**
 * Returns a tailored theme color class based on the zodiac element type.
 */
export function getZodiacElementColor(element: 'Fire' | 'Earth' | 'Air' | 'Water'): string {
  switch (element) {
    case 'Fire':
      return 'text-ruby font-semibold'; // Fire element is Red (Ruby)
    case 'Earth':
      return 'text-topaz font-semibold'; // Earth element is Yellow/Gold (Topaz)
    case 'Air':
      return 'text-sapphire font-semibold'; // Air element is Blue (Sapphire)
    case 'Water':
      return 'text-emerald font-semibold'; // Water element is Green/Teal (Emerald)
    default:
      return 'text-foreground';
  }
}

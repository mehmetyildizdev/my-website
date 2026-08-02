/**
 * Formats a raw date string into a user-friendly day-month-year string (e.g. 18 May 2026).
 */
export function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Converts a raw TMDB gender code into a readable string.
 */
export function genderLabel(g: number | null): string {
  if (g === 1) return 'Female';
  if (g === 2) return 'Male';
  return 'unspecified';
}

/**
 * Returns the tailwind class for the performer's popularity score.
 */
export function getPopularityColor(pop: number): string {
  if (pop < 5) return 'text-ruby';
  if (pop < 10) return 'text-topaz';
  if (pop < 25) return 'text-emerald';
  if (pop < 50) return 'text-sapphire';
  return 'text-amethyst animate-pulse font-black';
}

/**
 * Returns the theme color name (token) for a given 1-10 rating.
 */
export function getRatingToken(rating: number): 'amethyst' | 'sapphire' | 'emerald' | 'topaz' | 'ruby' {
  if (rating > 9) return 'amethyst';
  if (rating > 8) return 'sapphire';
  if (rating >= 7) return 'emerald';
  if (rating >= 5) return 'topaz';
  return 'ruby';
}

/**
 * Returns the theme color name (token) for a clustered average rating (5.5 - 7.5 scale).
 */
export function getAvgRatingToken(rating: number): 'amethyst' | 'sapphire' | 'emerald' | 'topaz' | 'ruby' {
  if (rating >= 7.0) return 'amethyst';
  if (rating >= 6.5) return 'sapphire';
  if (rating >= 6.0) return 'emerald';
  if (rating >= 5.5) return 'topaz';
  return 'ruby';
}

/**
 * Returns the CSS variable color value for a rating.
 */
export function getRatingColorVar(rating: number): string {
  return `var(--${getRatingToken(rating)})`;
}

/**
 * Returns the CSS variable color value for a clustered average rating.
 */
export function getAvgRatingColorVar(rating: number): string {
  return `var(--${getAvgRatingToken(rating)})`;
}

/**
 * Returns the Tailwind text color class for a rating.
 */
export function getRatingTextColorClass(rating: number): string {
  return `text-${getRatingToken(rating)}`;
}

/**
 * Returns the Tailwind bg color class for a rating.
 */
export function getRatingBgColorClass(rating: number): string {
  return `bg-${getRatingToken(rating)}`;
}

/**
 * Returns the Tailwind bg color class for a clustered average rating.
 */
export function getAvgRatingBgColorClass(rating: number): string {
  return `bg-${getAvgRatingToken(rating)}`;
}

/**
 * Returns the theme color name (token) for a clustered TV show average rating (7.0 - 8.0 scale).
 */
export function getShowAvgRatingToken(rating: number): 'amethyst' | 'sapphire' | 'emerald' | 'topaz' | 'ruby' {
  if (rating >= 8.0) return 'amethyst';
  if (rating >= 7.75) return 'sapphire';
  if (rating >= 7.5) return 'emerald';
  if (rating >= 7.25) return 'topaz';
  return 'ruby';
}

/**
 * Returns the Tailwind bg color class for a clustered TV show average rating.
 */
export function getShowAvgRatingBgColorClass(rating: number): string {
  return `bg-${getShowAvgRatingToken(rating)}`;
}

// ISO numeric → ISO alpha-2 mapping
// prettier-ignore
export const NUM_TO_ALPHA2: Record<string, string> = {
  "004":"AF","008":"AL","012":"DZ","016":"AS","020":"AD","024":"AO","028":"AG","031":"AZ",
  "032":"AR","036":"AU","040":"AT","044":"BS","048":"BH","050":"BD","051":"AM","052":"BB",
  "056":"BE","060":"BM","064":"BT","068":"BO","070":"BA","072":"BW","076":"BR","084":"BZ",
  "090":"SB","096":"BN","100":"BG","104":"MM","108":"BI","112":"BY","116":"KH","120":"CM",
  "124":"CA","140":"CF","144":"LK","148":"TD","152":"CL","156":"CN","158":"TW","170":"CO",
  "174":"KM","178":"CG","180":"CD","188":"CR","191":"HR","192":"CU","196":"CY","203":"CZ",
  "204":"BJ","208":"DK","212":"DM","214":"DO","218":"EC","818":"EG","222":"SV","226":"GQ",
  "231":"ET","232":"ER","233":"EE","234":"FO","242":"FJ","246":"FI","250":"FR","254":"GF",
  "266":"GA","268":"GE","270":"GM","275":"PS","276":"DE","288":"GH","300":"GR","308":"GD",
  "320":"GT","324":"GN","328":"GY","332":"HT","340":"HN","344":"HK","348":"HU","352":"IS",
  "356":"IN","360":"ID","364":"IR","368":"IQ","372":"IE","376":"IL","380":"IT",
  "384":"CI","388":"JM","392":"JP","398":"KZ","400":"JO","404":"KE","408":"KP","410":"KR",
  "414":"KW","417":"KG","418":"LA","422":"LB","426":"LS","428":"LV","430":"LR","434":"LY",
  "438":"LI","440":"LT","442":"LU","450":"MG","454":"MW","458":"MY","462":"MV","466":"ML",
  "470":"MT","478":"MR","480":"MU","484":"MX","492":"MC","496":"MN","498":"MD","499":"ME",
  "504":"MA","508":"MZ","512":"OM","516":"NA","524":"NP","528":"NL","540":"NC","554":"NZ",
  "558":"NI","562":"NE","566":"NG","578":"NO","586":"PK","591":"PA","598":"PG","600":"PY",
  "604":"PE","608":"PH","616":"PL","620":"PT","630":"PR","634":"QA","642":"RO","643":"RU",
  "646":"RW","682":"SA","686":"SN","688":"RS","694":"SL","702":"SG","703":"SK","704":"VN",
  "705":"SI","706":"SO","710":"ZA","716":"ZW","724":"ES","729":"SD","740":"SR","752":"SE",
  "756":"CH","760":"SY","762":"TJ","764":"TH","768":"TG","780":"TT","784":"AE","788":"TN",
  "792":"TR","795":"TM","800":"UG","804":"UA","826":"GB","834":"TZ","840":"US","854":"BF",
  "858":"UY","860":"UZ","862":"VE","887":"YE","894":"ZM","-99":"XK","728":"SS",
};

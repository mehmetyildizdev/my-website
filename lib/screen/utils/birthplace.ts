// lib/screen/utils/birthplace.ts

// US states mapped to "US" if they appear as the country/region segment
export const US_STATES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware",
  "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky",
  "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
  "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico",
  "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
  "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont",
  "virginia", "washington", "west virginia", "wisconsin", "wyoming", "d.c.", "district of columbia"
];

// Comprehensive mapping of country names, aliases, historical regions, colonial names, and native spellings to ISO codes
export const ALL_COUNTRIES_MAP: Record<string, string> = {
  // A
  "afghanistan": "AF",
  "aland islands": "AX",
  "albania": "AL",
  "algeria": "DZ",
  "french algeria": "DZ",
  "algerie": "DZ",
  "american samoa": "AS",
  "andorra": "AD",
  "angola": "AO",
  "anguilla": "AI",
  "antarctica": "AQ",
  "antigua and barbuda": "AG",
  "argentina": "AR",
  "armenia": "AM",
  "aruba": "AW",
  "australia": "AU",
  "austria": "AT",
  "oesterreich": "AT",
  "osterreich": "AT",
  "austro-hungarian empire": "AT",
  "austria-hungary": "AT",
  "azerbaijan": "AZ",

  // B
  "bahamas": "BS",
  "bahrain": "BH",
  "bangladesh": "BD",
  "east pakistan": "BD",
  "barbados": "BB",
  "belarus": "BY",
  "byelorussia": "BY",
  "byelorussian ssr": "BY",
  "belgium": "BE",
  "belgië": "BE",
  "belgie": "BE",
  "belgique": "BE",
  "belgien": "BE",
  "belize": "BZ",
  "british honduras": "BZ",
  "benin": "BJ",
  "dahomey": "BJ",
  "bermuda": "BM",
  "bhutan": "BT",
  "bolivia": "BO",
  "bosnia and herzegovina": "BA",
  "bosnia": "BA",
  "herzegovina": "BA",
  "botswana": "BW",
  "bechuanaland": "BW",
  "bouvet island": "BV",
  "brazil": "BR",
  "brasil": "BR",
  "british indian ocean territory": "IO",
  "brunei": "BN",
  "bulgaria": "BG",
  "burkina faso": "BF",
  "upper volta": "BF",
  "burundi": "BI",

  // C
  "cambodia": "KH",
  "kampuchea": "KH",
  "cameroon": "CM",
  "canada": "CA",
  "cape verde": "CV",
  "cabo verde": "CV",
  "cayman islands": "KY",
  "central african republic": "CF",
  "ubangi-shari": "CF",
  "chad": "TD",
  "chile": "CL",
  "china": "CN",
  "people's republic of china": "CN",
  "zhongguo": "CN",
  "hong kong": "HK",
  "british hong kong": "HK",
  "hongkong": "HK",
  "macau": "MO",
  "macao": "MO",
  "portuguese macau": "MO",
  "christmas island": "CX",
  "cocos (keeling) islands": "CC",
  "colombia": "CO",
  "comoros": "KM",
  "congo": "CG",
  "republic of the congo": "CG",
  "congo, democratic republic": "CD",
  "democratic republic of the congo": "CD",
  "dr congo": "CD",
  "drc": "CD",
  "belgian congo": "CD",
  "zaire": "CD",
  "cook islands": "CK",
  "costa rica": "CR",
  "cote d'ivoire": "CI",
  "cote d' ivoire": "CI",
  "ivory coast": "CI",
  "croatia": "HR",
  "hrvatska": "HR",
  "cuba": "CU",
  "cyprus": "CY",
  "czech republic": "CZ",
  "czechia": "CZ",
  "czechoslovakia": "CZ",
  "československo": "CZ",
  "ceskoslovensko": "CZ",
  "česká republika": "CZ",
  "ceska republika": "CZ",

  // D
  "denmark": "DK",
  "danmark": "DK",
  "djibouti": "DJ",
  "french somaliland": "DJ",
  "dominica": "DM",
  "dominican republic": "DO",

  // E
  "ecuador": "EC",
  "egypt": "EG",
  "el salvador": "SV",
  "equatorial guinea": "GQ",
  "eritrea": "ER",
  "estonia": "EE",
  "ethiopia": "ET",
  "abyssinia": "ET",
  "eswatini": "SZ",
  "swaziland": "SZ",

  // F
  "falkland islands": "FK",
  "faroe islands": "FO",
  "fiji": "FJ",
  "finland": "FI",
  "suomi": "FI",
  "france": "FR",
  "french republic": "FR",
  "french guiana": "GF",
  "french polynesia": "PF",
  "french southern territories": "TF",

  // G
  "gabon": "GA",
  "gambia": "GM",
  "georgia": "GE",
  "germany": "DE",
  "deutschland": "DE",
  "west germany": "DE",
  "east germany": "DE",
  "federal republic of germany": "DE",
  "german democratic republic": "DE",
  "gdr": "DE",
  "brd": "DE",
  "ddr": "DE",
  "german empire": "DE",
  "weimar republic": "DE",
  "nazi germany": "DE",
  "ghana": "GH",
  "gold coast": "GH",
  "gibraltar": "GI",
  "greece": "GR",
  "hellas": "GR",
  "ellada": "GR",
  "ελλάδα": "GR",
  "greenland": "GL",
  "grenada": "GD",
  "guadeloupe": "GP",
  "guam": "GU",
  "guatemala": "GT",
  "guernsey": "GG",
  "guinea": "GN",
  "french guinea": "GN",
  "guinea-bissau": "GW",
  "portuguese guinea": "GW",
  "guyana": "GY",
  "british guiana": "GY",

  // H
  "haiti": "HT",
  "heard island and mcdonald islands": "HM",
  "holy see": "VA",
  "vatican": "VA",
  "vatican city": "VA",
  "honduras": "HN",
  "hungary": "HU",
  "magyarország": "HU",
  "magyarorszag": "HU",

  // I
  "iceland": "IS",
  "ísland": "IS",
  "island": "IS",
  "india": "IN",
  "british india": "IN",
  "dominion of india": "IN",
  "bharat": "IN",
  "indonesia": "ID",
  "dutch east indies": "ID",
  "iran": "IR",
  "persia": "IR",
  "iraq": "IQ",
  "ireland": "IE",
  "éire": "IE",
  "eire": "IE",
  "republic of ireland": "IE",
  "isle of man": "IM",
  "israel": "IL",
  "mandatory palestine": "PS",
  "british palestine": "PS",
  "palestine": "PS",
  "italy": "IT",
  "italia": "IT",

  // J
  "jamaica": "JM",
  "japan": "JP",
  "nihon": "JP",
  "nippon": "JP",
  "日本": "JP",
  "jersey": "JE",
  "jordan": "JO",
  "transjordan": "JO",

  // K
  "kazakhstan": "KZ",
  "kazakh ssr": "KZ",
  "kenya": "KE",
  "kiribati": "KI",
  "north korea": "KP",
  "south korea": "KR",
  "korea": "KR",
  "republic of korea": "KR",
  "hanguk": "KR",
  "한국": "KR",
  "kuwait": "KW",
  "kyrgyzstan": "KG",
  "kyrgyz ssr": "KG",

  // L
  "laos": "LA",
  "latvia": "LV",
  "latvian ssr": "LV",
  "lebanon": "LB",
  "lesotho": "LS",
  "basutoland": "LS",
  "liberia": "LR",
  "libya": "LY",
  "liechtenstein": "LI",
  "lithuania": "LT",
  "lithuanian ssr": "LT",
  "luxembourg": "LU",

  // M
  "macedonia": "MK",
  "north macedonia": "MK",
  "madagascar": "MG",
  "malagasy republic": "MG",
  "malawi": "MW",
  "nyasaland": "MW",
  "malaysia": "MY",
  "malaya": "MY",
  "british malaya": "MY",
  "maldives": "MV",
  "mali": "ML",
  "french sudan": "ML",
  "malta": "MT",
  "marshall islands": "MH",
  "martinique": "MQ",
  "mauritania": "MR",
  "mauritius": "MU",
  "mayotte": "YT",
  "mexico": "MX",
  "méxico": "MX",
  "micronesia": "FM",
  "moldova": "MD",
  "moldavian ssr": "MD",
  "monaco": "MC",
  "mongolia": "MN",
  "montenegro": "ME",
  "montserrat": "MS",
  "morocco": "MA",
  "mozambique": "MZ",
  "portuguese mozambique": "MZ",
  "myanmar": "MM",
  "burma": "MM",

  // N
  "namibia": "NA",
  "south west africa": "NA",
  "nauru": "NR",
  "nepal": "NP",
  "netherlands": "NL",
  "nederland": "NL",
  "holland": "NL",
  "new caledonia": "NC",
  "new zealand": "NZ",
  "nicaragua": "NI",
  "niger": "NE",
  "nigeria": "NG",
  "british nigeria": "NG",
  "colonial nigeria": "NG",
  "federation of nigeria": "NG",
  "protectorate of nigeria": "NG",
  "niue": "NU",
  "norfolk island": "NF",
  "northern mariana islands": "MP",
  "norway": "NO",
  "norge": "NO",

  // O
  "oman": "OM",

  // P
  "pakistan": "PK",
  "palau": "PW",
  "panama": "PA",
  "papua new guinea": "PG",
  "paraguay": "PY",
  "peru": "PE",
  "philippines": "PH",
  "pitcairn": "PN",
  "poland": "PL",
  "polska": "PL",
  "portugal": "PT",
  "puerto rico": "PR",

  // Q
  "qatar": "QA",

  // R
  "reunion": "RE",
  "romania": "RO",
  "românia": "RO",
  "romania (now moldova)": "MD",
  "russia": "RU",
  "russian federation": "RU",
  "rossiya": "RU",
  "россия": "RU",
  "russian empire": "RU",
  "soviet union": "RU",
  "ussr": "RU",
  "cccp": "RU",
  "russian sfsr": "RU",
  "rwanda": "RW",

  // S
  "saint barthelemy": "BL",
  "saint helena": "SH",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint martin": "MF",
  "saint pierre and miquelon": "PM",
  "saint vincent and the grenadines": "VC",
  "samoa": "WS",
  "western samoa": "WS",
  "san marino": "SM",
  "sao tome and principe": "ST",
  "saudi arabia": "SA",
  "senegal": "SN",
  "serbia": "RS",
  "srbija": "RS",
  "србија": "RS",
  "yugoslavia": "YU",
  "sfr yugoslavia": "YU",
  "socialist federal republic of yugoslavia": "YU",
  "seychelles": "SC",
  "sierra leone": "SL",
  "singapore": "SG",
  "slovakia": "SK",
  "slovenia": "SI",
  "solomon islands": "SB",
  "somalia": "SO",
  "south africa": "ZA",
  "south georgia and south sandwich islands": "GS",
  "spain": "ES",
  "españa": "ES",
  "espana": "ES",
  "sri lanka": "LK",
  "ceylon": "LK",
  "british ceylon": "LK",
  "sudan": "SD",
  "suriname": "SR",
  "dutch guiana": "SR",
  "svalbard and jan mayen": "SJ",
  "sweden": "SE",
  "sverige": "SE",
  "switzerland": "CH",
  "schweiz": "CH",
  "suisse": "CH",
  "syria": "SY",

  // T
  "taiwan": "TW",
  "republic of china": "TW",
  "tajikistan": "TJ",
  "tajik ssr": "TJ",
  "tanzania": "TZ",
  "tanganyika": "TZ",
  "zanzibar": "TZ",
  "thailand": "TH",
  "siam": "TH",
  "timor-leste": "TL",
  "east timor": "TL",
  "togo": "TG",
  "tokelau": "TK",
  "tonga": "TO",
  "trinidad and tobago": "TT",
  "tunisia": "TN",
  "turkey": "TR",
  "türkiye": "TR",
  "turkiye": "TR",
  "turkei": "TR",
  "ottoman empire": "TR",
  "turkmenistan": "TM",
  "turkmen ssr": "TM",
  "turks and caicos islands": "TC",
  "tuvalu": "TV",

  // U
  "uganda": "UG",
  "ukraine": "UA",
  "ukrayina": "UA",
  "україна": "UA",
  "ukrainian ssr": "UA",
  "united arab emirates": "AE",
  "uae": "AE",
  "united kingdom": "GB",
  "uk": "GB",
  "u.k.": "GB",
  "england": "GB",
  "scotland": "GB",
  "wales": "GB",
  "northern ireland": "GB",
  "great britain": "GB",
  "united states": "US",
  "united states of america": "US",
  "usa": "US",
  "u.s.a.": "US",
  "us": "US",
  "u.s.": "US",
  "uruguay": "UY",
  "uzbekistan": "UZ",
  "uzbek ssr": "UZ",

  // V
  "vanuatu": "VU",
  "new hebrides": "VU",
  "venezuela": "VE",
  "vietnam": "VN",
  "viet nam": "VN",
  "french indochina": "VN",
  "north vietnam": "VN",
  "south vietnam": "VN",
  "virgin islands, british": "VG",
  "virgin islands, u.s.": "VI",

  // W
  "wallis and futuna": "WF",
  "western sahara": "EH",

  // Y
  "yemen": "YE",
  "north yemen": "YE",
  "south yemen": "YE",

  // Z
  "zambia": "ZM",
  "northern rhodesia": "ZM",
  "zimbabwe": "ZW",
  "rhodesia": "ZW",
  "southern rhodesia": "ZW"
};

/**
 * Strips diacritics and converts string to lowercase trimmed format
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\.$/, "");
}

/**
 * Parses a birthplace string (e.g. "Kenley, Surrey, England, UK" or "Lagos, British Nigeria") into an ISO 3166-1 alpha-2 code
 */
export function parseBirthplaceToCountry(place: string): string | null {
  if (!place) return null;
  const originalClean = place.trim().toLowerCase().replace(/\.$/, "");
  const normalized = normalizeString(place);

  // 1. Direct check on exact original or normalized birthplace string
  if (ALL_COUNTRIES_MAP[originalClean]) return ALL_COUNTRIES_MAP[originalClean];
  if (ALL_COUNTRIES_MAP[normalized]) return ALL_COUNTRIES_MAP[normalized];

  const originalParts = originalClean.split(",").map((p) => p.trim());
  const normalizedParts = normalized.split(",").map((p) => p.trim());
  const lastOriginalPart = originalParts[originalParts.length - 1] || "";
  const lastNormalizedPart = normalizedParts[normalizedParts.length - 1] || "";

  // 2. Check if the last segment matches any known country name or alias directly
  if (ALL_COUNTRIES_MAP[lastOriginalPart]) return ALL_COUNTRIES_MAP[lastOriginalPart];
  if (ALL_COUNTRIES_MAP[lastNormalizedPart]) return ALL_COUNTRIES_MAP[lastNormalizedPart];

  // 3. Check if the last segment is a US state
  if (US_STATES.includes(lastOriginalPart) || US_STATES.includes(lastNormalizedPart)) {
    return "US";
  }

  // 4. Scan the comma-separated parts from right to left for matches
  for (let i = normalizedParts.length - 1; i >= 0; i--) {
    const origPart = originalParts[i];
    const normPart = normalizedParts[i];
    if (origPart && ALL_COUNTRIES_MAP[origPart]) return ALL_COUNTRIES_MAP[origPart];
    if (normPart && ALL_COUNTRIES_MAP[normPart]) return ALL_COUNTRIES_MAP[normPart];
    if (US_STATES.includes(origPart) || US_STATES.includes(normPart)) return "US";
  }

  // 5. Scan for multi-word historical/colonial keys anywhere in the string (e.g., "British Nigeria", "Soviet Union", "West Germany")
  const sortedKeys = Object.keys(ALL_COUNTRIES_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key.length > 3) {
      if (originalClean.includes(key) || normalized.includes(key)) {
        return ALL_COUNTRIES_MAP[key];
      }
    }
  }

  // 6. Final fallback: check for any single word keys or US states in normalized text
  for (const key of sortedKeys) {
    if (originalClean.includes(key) || normalized.includes(key)) {
      return ALL_COUNTRIES_MAP[key];
    }
  }

  for (const state of US_STATES) {
    if (originalClean.includes(state) || normalized.includes(state)) {
      return "US";
    }
  }

  return null;
}

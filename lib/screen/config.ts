export const SCREEN_CONFIG = {
  pagination: {
    companiesNetworks: 12,
    collaborationWeb: 20,
    personCredits: 12,
  },
  limits: {
    performerGridMax: 250,
  },
  cacheDurations: {
    default: 86400,
    mediaSlugs: 2592000, // 30 days (very long cache for movies/shows)
    peopleSlugs: 604800, // 7 days (weekly cache for actors/crew)
    mainPages: 604800, // 7 days (weekly cache for landing, list, and stat pages)
  },
};

const STORAGE_KEY = 'kanji_stats_preferences';

const defaultPreferences = {
  showPhase: true,
  showInterval: true,
  showEaseFactor: true,
  showRepetitions: true,
  showNextReview: true,
};

export const loadStatsPreferences = () => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
};

export const saveStatsPreferences = (prefs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

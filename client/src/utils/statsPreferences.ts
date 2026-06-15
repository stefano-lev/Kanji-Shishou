import type { StatsPreferences } from '@/types';

const STORAGE_KEY = 'kanji_stats_preferences';

const defaultPreferences: StatsPreferences = {
  showPhase: true,
  showInterval: true,
  showEaseFactor: true,
  showRepetitions: true,
  showNextReview: true,
};

export const loadStatsPreferences = (): StatsPreferences => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as StatsPreferences) };
  } catch {
    return defaultPreferences;
  }
};

export const saveStatsPreferences = (prefs: StatsPreferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

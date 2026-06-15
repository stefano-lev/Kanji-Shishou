import type { HomePreferences } from '@/types';

const STORAGE_KEY = 'kanji_home_preferences';

const defaultPreferences: HomePreferences = {
  showOverviewStats: true,
  showCalendar: true,
  showAllTimeStats: true,
};

export const loadHomePreferences = (): HomePreferences => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as HomePreferences) };
  } catch {
    return defaultPreferences;
  }
};

export const saveHomePreferences = (prefs: HomePreferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

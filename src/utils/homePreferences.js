const STORAGE_KEY = 'kanji_home_preferences';

const defaultPreferences = {
  showOverviewStats: true,
  showCalendar: true,
  showAllTimeStats: true,
};

export const loadHomePreferences = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
};

export const saveHomePreferences = (prefs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

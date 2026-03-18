const FAVORITES_KEY = 'favorites';
const STATS_KEY = 'kanjiStats';

export const loadStats = () => {
  const data = localStorage.getItem(STATS_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveStats = (stats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const clearStats = () => {
  localStorage.removeItem(STATS_KEY);
};

export const updateKanji = (kanjiId, updatedData) => {
  const currentStats = loadStats() || {};
  currentStats[kanjiId] = {
    ...(currentStats[kanjiId] || {}),
    ...updatedData,
  };
  saveStats(currentStats);
};

export const initializeKanjiStats = (defaultData) => {
  if (!loadStats()) {
    saveStats(defaultData);
  }
};

export const getFavorites = () => {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const ALL_KEYS = [
  'kanjiStats',
  'kanjiSRS',
  'kanji_daily_stats',
  'kanji_srs_daily_progress',
  'favorites',
];

// Export everything as one object
export const exportAllData = () => {
  const data = {};

  ALL_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      data[key] = JSON.parse(value);
    }
  });

  return data;
};

// Import and overwrite everything
export const importAllData = (data) => {
  if (!data || typeof data !== 'object') return;

  ALL_KEYS.forEach((key) => {
    if (data[key]) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
};

export const saveSnapshot = () => {
  const snapshots = JSON.parse(localStorage.getItem('kanji_snapshots') || '[]');

  snapshots.push({
    date: new Date().toISOString(),
    data: exportAllData(),
  });

  localStorage.setItem('kanji_snapshots', JSON.stringify(snapshots));
};

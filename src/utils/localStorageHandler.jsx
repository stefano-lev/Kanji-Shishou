const FAVORITES_KEY = 'favorites';
const STATS_KEY = 'kanjiStats';
const SRS_KEY = 'kanjiSRS';

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

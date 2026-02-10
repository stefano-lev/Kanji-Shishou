const LOCAL_STORAGE_KEY = 'kanjiStats';
const FAVORITES_KEY = 'favorites';

export const saveKanjiStats = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const getKanjiStats = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const updateKanji = (kanjiId, updatedData) => {
  const currentStats = getKanjiStats() || {};
  currentStats[kanjiId] = {
    ...(currentStats[kanjiId] || {}),
    ...updatedData,
  };
  saveKanjiStats(currentStats);
};

export const initializeKanjiStats = (defaultData) => {
  if (!getKanjiStats()) {
    saveKanjiStats(defaultData);
  }
};

export const clearKanjiStats = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const getFavorites = () => {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

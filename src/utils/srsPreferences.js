const SRS_CONFIG_KEY = 'kanji_srs_preferences';

export const loadSRSConfig = () => {
  const data = localStorage.getItem(SRS_CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSRSConfig = (config) => {
  localStorage.setItem(SRS_CONFIG_KEY, JSON.stringify(config));
};

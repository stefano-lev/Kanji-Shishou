import type { SRSConfig } from '@/types';

const SRS_CONFIG_KEY = 'kanji_srs_preferences';

export const loadSRSConfig = (): SRSConfig | null => {
  const data = localStorage.getItem(SRS_CONFIG_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as SRSConfig;
  } catch {
    return null;
  }
};

export const saveSRSConfig = (config: SRSConfig) => {
  localStorage.setItem(SRS_CONFIG_KEY, JSON.stringify(config));
};

import type { BackupData, KanjiStat, KanjiStats, Snapshot } from '@/types';

const FAVORITES_KEY = 'favorites';
const STATS_KEY = 'kanjiStats';

const parseStoredJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const loadStats = (): KanjiStats => {
  const data = localStorage.getItem(STATS_KEY);
  return parseStoredJson<KanjiStats>(data, {});
};

export const saveStats = (stats: KanjiStats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const clearStats = () => {
  localStorage.removeItem(STATS_KEY);
};

export const updateKanji = (
  kanjiId: string,
  updatedData: Partial<KanjiStat>
) => {
  const currentStats = loadStats() || {};
  currentStats[kanjiId] = {
    ...(currentStats[kanjiId] || {}),
    ...updatedData,
  } as KanjiStat;
  saveStats(currentStats);
};

export const initializeKanjiStats = (defaultData: KanjiStats) => {
  if (Object.keys(loadStats()).length === 0) {
    saveStats(defaultData);
  }
};

export const getFavorites = (): string[] => {
  const data = localStorage.getItem(FAVORITES_KEY);
  return parseStoredJson<string[]>(data, []);
};

export const saveFavorites = (favorites: string[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const ALL_KEYS = [
  'kanjiStats',
  'kanjiSRS',
  'kanji_daily_stats',
  'kanji_srs_daily_progress',
  'favorites',
] as const;

export const exportAllData = (): BackupData => {
  const data: Record<string, unknown> = {};

  ALL_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      data[key] = parseStoredJson<unknown>(value, null);
    }
  });

  return data as BackupData;
};

export const importAllData = (data: BackupData) => {
  if (!data || typeof data !== 'object') return;

  ALL_KEYS.forEach((key) => {
    if (data[key]) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
};

export const saveSnapshot = () => {
  const snapshots = parseStoredJson<Snapshot[]>(
    localStorage.getItem('kanji_snapshots'),
    []
  );

  snapshots.push({
    date: new Date().toISOString(),
    data: exportAllData(),
  });

  localStorage.setItem('kanji_snapshots', JSON.stringify(snapshots));
};

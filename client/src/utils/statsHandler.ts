import * as storage from './localStorageHandler';

import type { KanjiStat, SRSStat } from '@/types';

export const createEmptyKanjiStat = (): KanjiStat => ({
  seen: 0,
  correct: 0,
  incorrect: 0,
  lastSeen: null,

  srs: {
    seen: 0,
    correct: 0,
    incorrect: 0,
    lastSeen: null,
  },
});

export const getAllStats = () => {
  return storage.loadStats();
};

export const getStatForKanji = (uid: string): KanjiStat => {
  const stats = storage.loadStats();
  return stats[uid] ?? createEmptyKanjiStat();
};

export const recordResult = (uid: string, isCorrect: boolean | null = null) => {
  const stats = storage.loadStats();
  const current = stats[uid] ?? createEmptyKanjiStat();

  const updated = {
    ...current,
    seen: current.seen + 1,
    lastSeen: new Date().toISOString(),
  };

  if (isCorrect === true) {
    updated.correct += 1;
  }

  if (isCorrect === false) {
    updated.incorrect += 1;
  }

  stats[uid] = updated;

  storage.saveStats(stats);
};

export const recordSRSResult = (
  uid: string,
  isCorrect: boolean | null = null
) => {
  const stats = storage.loadStats();
  const current = stats[uid] ?? createEmptyKanjiStat();

  const srs: SRSStat = current.srs ?? {
    seen: 0,
    correct: 0,
    incorrect: 0,
    lastSeen: null,
  };

  const updatedSRS = {
    ...srs,
    seen: srs.seen + 1,
    lastSeen: new Date().toISOString(),
  };

  if (isCorrect === true) updatedSRS.correct += 1;
  if (isCorrect === false) updatedSRS.incorrect += 1;

  stats[uid] = {
    ...current,
    srs: updatedSRS,
  };

  storage.saveStats(stats);
};

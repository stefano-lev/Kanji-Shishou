import * as storage from './localStorageHandler';

export const createEmptyKanjiStat = () => ({
  seen: 0,
  correct: 0,
  incorrect: 0,
  lastSeen: null,
});

export const getAllStats = () => {
  return storage.loadStats();
};

export const getStatForKanji = (uid) => {
  const stats = storage.loadStats();
  return stats[uid] ?? createEmptyKanjiStat();
};

export const recordResult = (uid, isCorrect = null) => {
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

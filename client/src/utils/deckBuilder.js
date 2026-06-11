import { kanjiByLevel } from '@data/kanjiData';

import { getAllStats } from './statsHandler';

export const getKanjiByLevels = (levels) => {
  const sortedLevels = [...levels].sort((a, b) => Number(b) - Number(a));

  return sortedLevels.flatMap((level) => {
    const kanji = kanjiByLevel[level] || [];

    return [...kanji].sort((a, b) =>
      a.uid.localeCompare(b.uid, undefined, { numeric: true })
    );
  });
};

export const getKanjiCountByLevels = (levels) => {
  return getKanjiByLevels(levels).length;
};

export const shuffleDeck = (deck) => {
  return [...deck].sort(() => Math.random() - 0.5);
};

export const getFilteredDeckCount = ({ levels, maxAccuracy = null }) => {
  let deck = getKanjiByLevels(levels);

  if (maxAccuracy !== null) {
    const stats = getAllStats();

    deck = deck.filter((kanji) => {
      const s = stats[kanji.uid];

      if (!s) return false;

      const total = s.correct + s.incorrect;

      if (total === 0) return false;

      const accuracy = (s.correct / total) * 100;

      return accuracy <= maxAccuracy;
    });
  }

  return deck.length;
};

export const buildDeck = ({
  levels,
  randomOrder = false,
  maxCards = null,
  maxAccuracy = null, // only include cards < x% accuracy
}) => {
  let deck = getKanjiByLevels(levels);

  if (maxAccuracy !== null) {
    const stats = getAllStats();

    deck = deck.filter((kanji) => {
      const s = stats[kanji.uid];

      if (!s) return false;

      const total = s.correct + s.incorrect;

      if (total === 0) return false;

      const accuracy = (s.correct / total) * 100;

      return accuracy <= maxAccuracy;
    });
  }

  // Shuffle
  if (randomOrder) {
    deck = shuffleDeck(deck);
  }

  // Limit deck size
  if (maxCards !== null && deck.length > maxCards) {
    deck = deck.slice(0, maxCards);
  }

  return deck;
};

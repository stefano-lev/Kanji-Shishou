import { useState, useMemo, useEffect } from 'react';

import {
  getKanjiCountByLevels,
  getFilteredDeckCount,
} from '@utils/deckBuilder';

const useQuizDeckConfig = () => {
  const [selectedLevels, setSelectedLevels] = useState(['5']);

  const [maxAccuracyEnabled, setMaxAccuracyEnabled] = useState(false);
  const [maxAccuracy, setMaxAccuracy] = useState(100);

  const [maxCardsEnabled, setMaxCardsEnabled] = useState(false);
  const [maxCards, setMaxCards] = useState(25);

  const maxPossibleCards = getKanjiCountByLevels(selectedLevels);

  const predictedCount = useMemo(() => {
    return getFilteredDeckCount({
      levels: selectedLevels,
      maxAccuracy: maxAccuracyEnabled ? maxAccuracy : null,
    });
  }, [selectedLevels, maxAccuracyEnabled, maxAccuracy]);

  const finalDeckSize = maxCardsEnabled
    ? Math.min(predictedCount, maxCards)
    : predictedCount;

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  useEffect(() => {
    if (maxCards > maxPossibleCards) {
      setMaxCards(maxPossibleCards);
    }
  }, [maxPossibleCards, maxCards]);

  return {
    selectedLevels,
    toggleLevel,

    maxAccuracyEnabled,
    setMaxAccuracyEnabled,
    maxAccuracy,
    setMaxAccuracy,

    maxCardsEnabled,
    setMaxCardsEnabled,
    maxCards,
    setMaxCards,

    maxPossibleCards,
    predictedCount,
    finalDeckSize,
  };
};

export default useQuizDeckConfig;
